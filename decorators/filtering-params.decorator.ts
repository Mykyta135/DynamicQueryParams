import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

// The FilterRule enum remains the same
export enum FilterRule {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
  LIKE = 'like',
  NOT_LIKE = 'nlike',
  IN = 'in',
  NOT_IN = 'nin',
  IS_NULL = 'isnull',
  IS_NOT_NULL = 'isnotnull',
}

// The Filtering interface is updated to allow for more flexible value types
export interface Filtering {
  property: string;
  rule: FilterRule;
  value: string | number | boolean | (string | number | boolean)[] | null;
}

// NEW: Define the shape of the configuration object
export type FilterableProperties = {
  [property: string]: 'string' | 'number' | 'boolean';
};

// Programmatically generate the regex from the enum to avoid repetition (DRY)
const validRules = Object.values(FilterRule).join('|');
const FILTER_PATTERN = new RegExp(
  `^([a-zA-Z0-9_]+):(${validRules})(?::(.*))?$`,
);

/**
 * A decorator to parse multiple, type-safe filter parameters from the request query.
 * Expects filters in the format: `?filter=property:rule:value&filter=property2:rule2:value2`
 */
export const FilteringParams = createParamDecorator(
  (config: FilterableProperties, ctx: ExecutionContext): Filtering[] | null => {
    // --- 1. Developer Configuration Validation ---
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      // This is a server-side configuration error, not a client error.
      throw new InternalServerErrorException(
        'Invalid configuration for FilteringParams decorator. Expected an object.',
      );
    }

    const req: Request = ctx.switchToHttp().getRequest();
    const filters = req.query.filter;
    if (!filters) {
      return null;
    }

    // Ensure filters are always processed as an array
    const filterArray = Array.isArray(filters) ? filters : [filters];
    const parsedFilters: Filtering[] = [];

    // --- 2. Loop Through Each Filter ---
    for (const filter of filterArray) {
      if (typeof filter !== 'string') {
        throw new BadRequestException('Invalid filter parameter format.');
      }

      const match = filter.match(FILTER_PATTERN);
      if (!match) {
        throw new BadRequestException(
          `Invalid filter format: "${filter}". Expected format: property:rule[:value]`,
        );
      }

      const [, property, rule, rawValue] = match;
      const value = rawValue === undefined ? null : rawValue;

      // --- 3. Property and Rule Validation ---
      const validProperties = Object.keys(config);
      if (!validProperties.includes(property)) {
        throw new BadRequestException(
          `Invalid filter property: "${property}". Valid properties are: ${validProperties.join(
            ', ',
          )}`,
        );
      }

      let processedValue: Filtering['value'] = value;

      // --- 4. Value Processing and Type Coercion ---
      switch (rule as FilterRule) {
        case FilterRule.IN:
        case FilterRule.NOT_IN:
          if (value === null || value === '') {
            throw new BadRequestException(
              `Rule "${rule}" requires a non-empty, comma-separated value.`,
            );
          }
          processedValue = value.split(',');
          break;

        case FilterRule.IS_NULL:
        case FilterRule.IS_NOT_NULL:
          if (value !== null) {
            throw new BadRequestException(
              `Rule "${rule}" does not accept a value.`,
            );
          }
          break;

        default:
          if (value === null) {
            throw new BadRequestException(`Rule "${rule}" requires a value.`);
          }
          break;
      }

      // Coerce types for 'IN' and 'NOT_IN' arrays
      if (Array.isArray(processedValue)) {
        processedValue = processedValue.map((v) =>
          coerceType(v as string, config[property]),
        );
      } else if (processedValue !== null) {
        // Coerce types for all other values
        processedValue = coerceType(processedValue, config[property]);
      }

      parsedFilters.push({
        property,
        rule: rule as FilterRule,
        value: processedValue,
      });
    }

    return parsedFilters;
  },
);

/**
 * Helper function to convert a string value to its configured type.
 */
function coerceType(
  value: string,
  type: 'string' | 'number' | 'boolean',
): string | number | boolean {
  switch (type) {
    case 'number':
      // eslint-disable-next-line no-case-declarations
      const num = parseFloat(value);
      if (isNaN(num)) {
        throw new BadRequestException(
          `Invalid numeric value for filter: "${value}"`,
        );
      }
      return num;
    case 'boolean':
      if (value !== 'true' && value !== 'false') {
        throw new BadRequestException(
          `Invalid boolean value for filter: "${value}". Must be 'true' or 'false'.`,
        );
      }
      return value === 'true';
    default:
      return value;
  }
}

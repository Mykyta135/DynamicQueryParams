import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

export interface Sorting {
  property: string;
  direction: 'asc' | 'desc';
}

export const SortingParams = createParamDecorator(
  (validParams: string[], ctx: ExecutionContext): Sorting[] | null => {
    // --- 1. Developer Configuration Validation ---
    if (!validParams || !Array.isArray(validParams)) {
      throw new InternalServerErrorException(
        'Invalid configuration for SortingParams decorator. Expected an array of strings.',
      );
    }

    const req: Request = ctx.switchToHttp().getRequest();
    const sortQuery = req.query.sort as string;
    if (!sortQuery) {
      return null;
    }

    const sortPattern = /^([a-zA-Z0-9_]+):(asc|desc)$/;
    const sorts = sortQuery.split(',');
    const parsedSorts: Sorting[] = [];

    // --- 2. Loop Through Each Sort Condition ---
    for (const sort of sorts) {
      const match = sort.match(sortPattern);
      if (!match) {
        throw new BadRequestException(
          `Invalid sort parameter format: "${sort}". Expected format: property:direction`,
        );
      }

      const [, property, direction] = match;

      if (!validParams.includes(property)) {
        throw new BadRequestException(
          `Invalid sort property: "${property}". Valid properties are: ${validParams.join(', ')}`,
        );
      }

      parsedSorts.push({ property, direction: direction as 'asc' | 'desc' });
    }

    return parsedSorts;
  },
);

import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';

export interface Pagination {
  page: number;
  limit: number;
  size: number;
  offset: number;
}

// Define defaults
const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 100;

/**
 * A decorator to parse pagination parameters with defaults and validation.
 */
export const PaginationParams = createParamDecorator(
  (data, ctx: ExecutionContext): Pagination => {
    const req: Request = ctx.switchToHttp().getRequest();

    // --- 1. Parse with Defaults ---
    let page = parseInt(req.query.page as string);
    let size = parseInt(req.query.size as string);

    if (isNaN(page) || page < 0) {
      page = DEFAULT_PAGE;
    }

    if (isNaN(size) || size <= 0) {
      size = DEFAULT_SIZE;
    }

    // --- 2. Validate Limits ---
    if (size > MAX_SIZE) {
      throw new BadRequestException(
        `Pagination size cannot exceed ${MAX_SIZE}.`,
      );
    }

    const limit = size;
    const offset = page * limit;

    return { page, limit, size, offset };
  },
);

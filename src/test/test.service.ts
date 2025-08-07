import { Injectable } from '@nestjs/common';
import { Filtering } from 'decorators/filtering-params.decorator';
import { Pagination } from 'decorators/pagination-params.decorator';
import { Sorting } from 'decorators/sorting-params.decorator';

@Injectable()
export class TestService {
  // In a real app, this method would interact with a database.
  // For this demonstration, we return the parsed parameters to show they are correct.
  find(params: {
    filters: Filtering[] | null;
    sorts: Sorting[] | null;
    pagination: Pagination;
  }) {
    return {
      message: 'Successfully parsed all query parameters.',
      receivedParameters: params,
      // Example of how you would use this data in a real service:
      exampleDatabaseQuery: {
        where: params.filters, // This would be translated to TypeORM/Prisma format
        orderBy: params.sorts,
        skip: params.pagination.offset,
        take: params.pagination.limit,
      },
    };
  }
}

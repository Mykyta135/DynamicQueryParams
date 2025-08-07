import { Controller, Get } from '@nestjs/common';
import {
  FilterableProperties,
  Filtering,
  FilteringParams,
} from 'decorators/filtering-params.decorator';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Sorting, SortingParams } from 'decorators/sorting-params.decorator';
import {
  Pagination,
  PaginationParams,
} from 'decorators/pagination-params.decorator';
import { TestService } from './test.service';

// Define the properties that can be filtered and their types
const userFilterConfig: FilterableProperties = {
  name: 'string',
  email: 'string',
  age: 'number',
  isActive: 'boolean',
};

// Define the properties that can be sorted
const userSortableParams = ['name', 'email', 'age', 'createdAt'];

@ApiTags('Users')
@Controller('users')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  @ApiOperation({
    summary: 'Find all users with advanced filtering, sorting, and pagination',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    isArray: true, // Crucial for allowing multiple filter parameters
    style: 'form',
    explode: true,
    type: String,
    description:
      'Filter format: `property:rule:value`. E.g., `age:gt:30` or `isActive:eq:true`',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    description:
      'Sorting format: `property:direction`. E.g., `age:desc,name:asc`',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 0)',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the parsed query parameters.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid query parameter format.',
  })
  findAll(
    @FilteringParams(userFilterConfig) filters: Filtering[] | null,
    @SortingParams(userSortableParams) sorts: Sorting[] | null,
    @PaginationParams() pagination: Pagination,
  ) {
    return this.testService.find({ filters, sorts, pagination });
  }
}

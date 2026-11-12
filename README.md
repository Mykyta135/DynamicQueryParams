# DynamicQueryParams

Three NestJS parameter decorators that turn query strings into typed, validated pagination, sorting and filtering objects. Bad input from the client returns `400`; a misconfigured decorator on the server side returns `500`, so the two kinds of mistakes don't get mixed up.

## Pagination

```
GET /items?page=2&size=50
```

`@PaginationParams()` returns `{ page, size, limit, offset }`. Defaults are page `0` and size `20`; sizes above `100` are rejected, so a client can't ask for the whole table.

## Sorting

```
GET /items?sort=createdAt:desc,name:asc
```

`@SortingParams(['createdAt', 'name'])` returns an array of `{ property, direction }`. Only the properties you whitelist are accepted.

## Filtering

```
GET /items?filter=price:gte:100&filter=status:in:active,paused&filter=deletedAt:isnull
```

`@FilteringParams({ price: 'number', status: 'string', deletedAt: 'string' })` returns an array of `{ property, rule, value }`, with values cast to the declared type.

Rules: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `nlike`, `in`, `nin`, `isnull`, `isnotnull`. `in`/`nin` take a comma-separated list; `isnull`/`isnotnull` take no value.

## Usage

```ts
@Get()
findAll(
  @PaginationParams() pagination: Pagination,
  @SortingParams(['createdAt', 'name']) sort: Sorting[] | null,
  @FilteringParams({ price: 'number', status: 'string' }) filters: Filtering[] | null,
) {
  return this.itemsService.findAll(pagination, sort, filters);
}
```

The decorators live in [`decorators/`](decorators) and only depend on `@nestjs/common` and Express types.

## Run

```bash
npm install
npm run start:dev
```

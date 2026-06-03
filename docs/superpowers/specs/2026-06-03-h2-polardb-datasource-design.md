# H2 And PolarDB Datasource Design

## Goal

Add first-class H2 and PolarDB datasource types to DataRoom while following the existing relational datasource conventions.

## Approved Design

- Add `h2` and `polardb` as independent datasource wire values.
- Backend maps both types through `DataSourceType` and `BaseDataSource` polymorphic JSON.
- Both datasource beans extend `RelationalDatasource`, so they reuse driver name, username, password, and URL handling.
- Frontend adds H2 and PolarDB to the datasource selector, API types, default driver selection, and dedicated editor components.
- H2 uses default driver `org.h2.Driver`.
- PolarDB uses default driver `com.mysql.cj.jdbc.Driver`.
- Copy the provided icons into the frontend datasource image directory.

## Testing

- Backend JSON tests must prove `h2` and `polardb` deserialize as relational datasource configurations.
- Frontend type-check must prove the new datasource keys and editor components are wired consistently.

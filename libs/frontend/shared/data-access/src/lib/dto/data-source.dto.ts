import { IDataSource } from '@detective.solutions/shared/data-access';

export enum DataSourceType {
  EXCEL = 'excel',
  PDF = 'pdf',
  MONGO_DB = 'mongodb',
  MY_SQL = 'mysql',
  MARIA_DB = 'mariadb',
  POSTGRES = 'postgresql',
  ORACLE_DB = 'oracle',
  MICROSOFT_SQL = 'mssql',
  AZURE_SQL = 'azure-sql',
  AZURE_BLOB = 'azure-blob',
  AWS_BLOB = 'aws-blob',
  AWS_DYNAMODB = 'aws-dynamo',
}

export class DataSource implements IDataSource {
  static readonly excelThumbnail = 'assets/icons/data-sources/excel.svg';
  static readonly pdfThumbnail = 'assets/icons/data-sources/pdf.svg';
  static readonly mongoDbThumbnail = 'assets/icons/data-sources/mongo-db.svg';
  static readonly mySqlThumbnail = 'assets/icons/data-sources/my-sql.svg';
  static readonly mariaDbThumbnail = 'assets/icons/data-sources/maria-db.svg';
  static readonly postgresThumbnail = 'assets/icons/data-sources/postgres.svg';
  static readonly oracleDbThumbnail = 'assets/icons/data-sources/oracle-db.svg';
  static readonly microsoftSqlThumbnail = 'assets/icons/data-sources/ms-sql.svg';
  static readonly azureSqlThumbnail = 'assets/icons/data-sources/azure-sql.svg';
  static readonly azureBlobThumbnail = 'assets/icons/data-sources/azure-blob.svg';
  static readonly awsBlobThumbnail = 'assets/icons/data-sources/aws-blob.svg';
  static readonly awsDynamoDbThumbnail = 'assets/icons/data-sources/aws-dynamodb.svg';
  static readonly defaultThumbnail = 'assets/icons/data-sources/default.svg';

  constructor(
    public id = '',
    public name = '',
    public connectorName = '',
    public description = '',
    public iconSrc = '',
    public lastUpdated: Date | null = null
  ) {}

  static Build(dataSource: IDataSource) {
    if (!dataSource) {
      return new DataSource();
    }

    return new DataSource(
      dataSource.id,
      dataSource.name,
      dataSource.connectorName,
      dataSource.description,
      dataSource.iconSrc ?? DataSource.getDataSourceIconSrc(dataSource.connectorName),
      (dataSource.lastUpdated as Date) ?? new Date()
    );
  }

  private static getDataSourceIconSrc(dataSourceType: string): string {
    switch (dataSourceType) {
      case DataSourceType.EXCEL:
        return DataSource.excelThumbnail;
      case DataSourceType.PDF:
        return DataSource.pdfThumbnail;
      case DataSourceType.MONGO_DB:
        return DataSource.mongoDbThumbnail;
      case DataSourceType.MY_SQL:
        return DataSource.mySqlThumbnail;
      case DataSourceType.MARIA_DB:
        return DataSource.mariaDbThumbnail;
      case DataSourceType.POSTGRES:
        return DataSource.postgresThumbnail;
      case DataSourceType.ORACLE_DB:
        return DataSource.oracleDbThumbnail;
      case DataSourceType.MICROSOFT_SQL:
        return DataSource.microsoftSqlThumbnail;
      case DataSourceType.AZURE_SQL:
        return DataSource.azureSqlThumbnail;
      case DataSourceType.AZURE_BLOB:
        return DataSource.azureBlobThumbnail;
      case DataSourceType.AWS_BLOB:
        return DataSource.awsBlobThumbnail;
      case DataSourceType.AWS_DYNAMODB:
        return DataSource.awsDynamoDbThumbnail;
      default:
        return DataSource.defaultThumbnail;
    }
  }

  toJSON(): object {
    const serialized = Object.assign(this);
    delete serialized.id;
    return serialized;
  }
}

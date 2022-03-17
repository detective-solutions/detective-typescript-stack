import { IDataSource } from '@detective.solutions/shared/data-access';

export enum DataSourceType {
  EXCEL = 'excel',
  PDF = 'pdf',
  POSTGRES = 'postgresql',
  MICROSOFT_SQL = 'mssql',
  MY_SQL = 'mysql',
  AZURE_SQL = 'azure-sql',
  AZURE_BLOB = 'azure-blob',
  AWS_BLOB = 'aws-blob',
  AWS_DYNAMODB = 'aws-dynamo',
}

export class DataSource implements IDataSource {
  static readonly excelThumbnail = 'assets/icons/data-sources/excel.svg';
  static readonly pdfThumbnail = 'assets/icons/data-sources/pdf.svg';
  static readonly postgresThumbnail = 'assets/icons/data-sources/postgres.svg';
  static readonly microsoftSqlThumbnail = 'assets/icons/data-sources/ms-sql.svg';
  static readonly mySqlThumbnail = 'assets/icons/data-sources/my-sql.svg';
  static readonly azureSqlThumbnail = 'assets/icons/data-sources/azure-sql.svg';
  static readonly azureBlobThumbnail = 'assets/icons/data-sources/azure-blob.svg';
  static readonly awsBlobThumbnail = 'assets/icons/data-sources/aws-blob.svg';
  static readonly awsDynamoDbThumbnail = 'assets/icons/data-sources/aws-dynamodb.svg';
  static readonly defaultThumbnail = 'assets/icons/data-sources/default.svg';

  constructor(
    public id = '',
    public name = '',
    public db_type = '',
    public description = '',
    public iconSrc = '',
    public lastUpdated: Date | null = null
  ) {}

  static Build(dataSource: IDataSource) {
    if (!dataSource) {
      return new DataSource();
    }

    dataSource = Object.assign({ iconSrc: '' }, { ...dataSource });

    switch (dataSource.db_type) {
      case DataSourceType.EXCEL:
        dataSource.iconSrc = DataSource.excelThumbnail;
        break;
      case DataSourceType.PDF:
        dataSource.iconSrc = DataSource.pdfThumbnail;
        break;
      case DataSourceType.POSTGRES:
        dataSource.iconSrc = DataSource.postgresThumbnail;
        break;
      case DataSourceType.MICROSOFT_SQL:
        dataSource.iconSrc = DataSource.microsoftSqlThumbnail;
        break;
      case DataSourceType.MY_SQL:
        dataSource.iconSrc = DataSource.mySqlThumbnail;
        break;
      case DataSourceType.AZURE_SQL:
        dataSource.iconSrc = DataSource.azureSqlThumbnail;
        break;
      case DataSourceType.AZURE_BLOB:
        dataSource.iconSrc = DataSource.azureBlobThumbnail;
        break;
      case DataSourceType.AWS_BLOB:
        dataSource.iconSrc = DataSource.awsBlobThumbnail;
        break;
      case DataSourceType.AWS_DYNAMODB:
        dataSource.iconSrc = DataSource.awsDynamoDbThumbnail;
        break;
      default:
        dataSource.iconSrc = DataSource.defaultThumbnail;
    }

    return new DataSource(
      dataSource.id,
      dataSource.name,
      dataSource.db_type,
      dataSource.description,
      dataSource.iconSrc,
      (dataSource.lastUpdated as Date) ?? new Date()
    );
  }

  toJSON(): object {
    const serialized = Object.assign(this);
    delete serialized.id;
    return serialized;
  }
}

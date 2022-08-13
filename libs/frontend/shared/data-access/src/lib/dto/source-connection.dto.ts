import { ISourceConnection, SourceConnectionStatus } from '@detective.solutions/shared/data-access';

export enum SourceConnectorName {
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

export class SourceConnection implements ISourceConnection {
  static readonly iconBasePath = 'assets/icons/source-connections/';

  static readonly excelThumbnail = SourceConnection.iconBasePath + 'excel.svg';
  static readonly pdfThumbnail = SourceConnection.iconBasePath + 'pdf.svg';
  static readonly mongoDbThumbnail = SourceConnection.iconBasePath + 'mongo-db.svg';
  static readonly mySqlThumbnail = SourceConnection.iconBasePath + 'my-sql.svg';
  static readonly mariaDbThumbnail = SourceConnection.iconBasePath + 'maria-db.svg';
  static readonly postgresThumbnail = SourceConnection.iconBasePath + 'postgres.svg';
  static readonly oracleDbThumbnail = SourceConnection.iconBasePath + 'oracle-db.svg';
  static readonly microsoftSqlThumbnail = SourceConnection.iconBasePath + 'ms-sql.svg';
  static readonly azureSqlThumbnail = SourceConnection.iconBasePath + 'azure-sql.svg';
  static readonly azureBlobThumbnail = SourceConnection.iconBasePath + 'azure-blob.svg';
  static readonly awsBlobThumbnail = SourceConnection.iconBasePath + 'aws-blob.svg';
  static readonly awsDynamoDbThumbnail = SourceConnection.iconBasePath + 'aws-dynamodb.svg';
  static readonly defaultThumbnail = SourceConnection.iconBasePath + 'default.svg';

  constructor(
    public id: string,
    public name: string,
    public connectorName: string,
    public description: string,
    public iconSrc: string,
    public status: SourceConnectionStatus,
    public lastUpdated: string
  ) {}

  static Build(sourceConnectionInput: ISourceConnection) {
    return new SourceConnection(
      sourceConnectionInput.id,
      sourceConnectionInput.name,
      sourceConnectionInput.connectorName,
      sourceConnectionInput.description ?? '',
      sourceConnectionInput.iconSrc ?? SourceConnection.getIconSrc(sourceConnectionInput.connectorName),
      sourceConnectionInput.status,
      sourceConnectionInput.lastUpdated
    );
  }

  private static getIconSrc(sourceConnectionType: string): string {
    switch (sourceConnectionType) {
      case SourceConnectorName.EXCEL:
        return SourceConnection.excelThumbnail;
      case SourceConnectorName.PDF:
        return SourceConnection.pdfThumbnail;
      case SourceConnectorName.MONGO_DB:
        return SourceConnection.mongoDbThumbnail;
      case SourceConnectorName.MY_SQL:
        return SourceConnection.mySqlThumbnail;
      case SourceConnectorName.MARIA_DB:
        return SourceConnection.mariaDbThumbnail;
      case SourceConnectorName.POSTGRES:
        return SourceConnection.postgresThumbnail;
      case SourceConnectorName.ORACLE_DB:
        return SourceConnection.oracleDbThumbnail;
      case SourceConnectorName.MICROSOFT_SQL:
        return SourceConnection.microsoftSqlThumbnail;
      case SourceConnectorName.AZURE_SQL:
        return SourceConnection.azureSqlThumbnail;
      case SourceConnectorName.AZURE_BLOB:
        return SourceConnection.azureBlobThumbnail;
      case SourceConnectorName.AWS_BLOB:
        return SourceConnection.awsBlobThumbnail;
      case SourceConnectorName.AWS_DYNAMODB:
        return SourceConnection.awsDynamoDbThumbnail;
      default:
        return SourceConnection.defaultThumbnail;
    }
  }
}

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

export class SourceConnectionDTO implements ISourceConnection {
  static readonly iconBasePath = 'assets/icons/source-connections/';

  static readonly excelThumbnail = SourceConnectionDTO.iconBasePath + 'excel.svg';
  static readonly pdfThumbnail = SourceConnectionDTO.iconBasePath + 'pdf.svg';
  static readonly mongoDbThumbnail = SourceConnectionDTO.iconBasePath + 'mongo-db.svg';
  static readonly mySqlThumbnail = SourceConnectionDTO.iconBasePath + 'my-sql.svg';
  static readonly mariaDbThumbnail = SourceConnectionDTO.iconBasePath + 'maria-db.svg';
  static readonly postgresThumbnail = SourceConnectionDTO.iconBasePath + 'postgres.svg';
  static readonly oracleDbThumbnail = SourceConnectionDTO.iconBasePath + 'oracle-db.svg';
  static readonly microsoftSqlThumbnail = SourceConnectionDTO.iconBasePath + 'ms-sql.svg';
  static readonly azureSqlThumbnail = SourceConnectionDTO.iconBasePath + 'azure-sql.svg';
  static readonly azureBlobThumbnail = SourceConnectionDTO.iconBasePath + 'azure-blob.svg';
  static readonly awsBlobThumbnail = SourceConnectionDTO.iconBasePath + 'aws-blob.svg';
  static readonly awsDynamoDbThumbnail = SourceConnectionDTO.iconBasePath + 'aws-dynamodb.svg';
  static readonly defaultThumbnail = SourceConnectionDTO.iconBasePath + 'default.svg';

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
    return new SourceConnectionDTO(
      sourceConnectionInput.id,
      sourceConnectionInput.name,
      sourceConnectionInput.connectorName,
      sourceConnectionInput.description ?? '',
      sourceConnectionInput.iconSrc ?? SourceConnectionDTO.getIconSrc(sourceConnectionInput.connectorName),
      sourceConnectionInput.status,
      sourceConnectionInput.lastUpdated
    );
  }

  private static getIconSrc(sourceConnectionType: string): string {
    switch (sourceConnectionType) {
      case SourceConnectorName.EXCEL:
        return SourceConnectionDTO.excelThumbnail;
      case SourceConnectorName.PDF:
        return SourceConnectionDTO.pdfThumbnail;
      case SourceConnectorName.MONGO_DB:
        return SourceConnectionDTO.mongoDbThumbnail;
      case SourceConnectorName.MY_SQL:
        return SourceConnectionDTO.mySqlThumbnail;
      case SourceConnectorName.MARIA_DB:
        return SourceConnectionDTO.mariaDbThumbnail;
      case SourceConnectorName.POSTGRES:
        return SourceConnectionDTO.postgresThumbnail;
      case SourceConnectorName.ORACLE_DB:
        return SourceConnectionDTO.oracleDbThumbnail;
      case SourceConnectorName.MICROSOFT_SQL:
        return SourceConnectionDTO.microsoftSqlThumbnail;
      case SourceConnectorName.AZURE_SQL:
        return SourceConnectionDTO.azureSqlThumbnail;
      case SourceConnectorName.AZURE_BLOB:
        return SourceConnectionDTO.azureBlobThumbnail;
      case SourceConnectorName.AWS_BLOB:
        return SourceConnectionDTO.awsBlobThumbnail;
      case SourceConnectorName.AWS_DYNAMODB:
        return SourceConnectionDTO.awsDynamoDbThumbnail;
      default:
        return SourceConnectionDTO.defaultThumbnail;
    }
  }
}

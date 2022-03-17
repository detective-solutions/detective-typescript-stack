import { IDataSource } from '@detective.solutions/shared/data-access';

export enum DataSourceType {
  SQL = 'mysql',
  POSTGRES = 'postgresql',
  EXCEL = 'excel',
  PDF = 'pdf',
  AZURE_BLOB = 'azureBlob',
  AWS_BLOB = 'awsBlob',
}

export class DataSource implements IDataSource {
  static readonly sqlThumbnail = 'assets/icons/data-sources/sql.svg';
  static readonly excelThumbnail = 'assets/icons/data-sources/excel.svg';
  static readonly pdfThumbnail = 'assets/icons/data-sources/pdf.svg';
  static readonly azureBlobThumbnail = 'assets/icons/data-sources/azureBlob.svg';
  static readonly awsBlobThumbnail = 'assets/icons/data-sources/awsBlob.svg';

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
      case DataSourceType.SQL:
        dataSource.iconSrc = DataSource.sqlThumbnail;
        break;
      case DataSourceType.POSTGRES:
        dataSource.iconSrc = DataSource.sqlThumbnail;
        break;
      case DataSourceType.EXCEL:
        dataSource.iconSrc = DataSource.excelThumbnail;
        break;
      case DataSourceType.PDF:
        dataSource.iconSrc = DataSource.pdfThumbnail;
        break;
      case DataSourceType.AZURE_BLOB:
        dataSource.iconSrc = DataSource.azureBlobThumbnail;
        break;
      case DataSourceType.AWS_BLOB:
        dataSource.iconSrc = DataSource.awsBlobThumbnail;
    }

    return new DataSource(
      dataSource.id,
      dataSource.name ?? 'Test',
      dataSource.db_type,
      dataSource.description ?? 'Test',
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

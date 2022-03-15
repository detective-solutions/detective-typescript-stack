export interface IDataSource {
  _id: string;
  name: string;
  type: string;
  description?: string;
  thumbnailSrc?: string;
  lastUpdated?: Date | null | string;
}

export enum IDataSourceType {
  SQL = 'sql',
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
    public _id = '',
    public name = '',
    public type = '',
    public description = '',
    public thumbnailSrc = '',
    public lastUpdated: Date | null = null
  ) {}

  static Build(dataSource: IDataSource) {
    if (!dataSource) {
      return new DataSource();
    }

    switch (dataSource.type) {
      case IDataSourceType.SQL:
        dataSource.thumbnailSrc = DataSource.sqlThumbnail;
        break;
      case IDataSourceType.EXCEL:
        dataSource.thumbnailSrc = DataSource.excelThumbnail;
        break;
      case IDataSourceType.PDF:
        dataSource.thumbnailSrc = DataSource.pdfThumbnail;
        break;
      case IDataSourceType.AZURE_BLOB:
        dataSource.thumbnailSrc = DataSource.azureBlobThumbnail;
        break;
      case IDataSourceType.AWS_BLOB:
        dataSource.thumbnailSrc = DataSource.awsBlobThumbnail;
    }

    return new DataSource(
      dataSource._id,
      dataSource.name,
      dataSource.type,
      dataSource.description,
      dataSource.thumbnailSrc,
      dataSource.lastUpdated as Date
    );
  }

  toJSON(): object {
    const serialized = Object.assign(this);
    delete serialized._id;
    return serialized;
  }
}

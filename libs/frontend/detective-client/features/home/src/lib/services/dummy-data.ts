import { ICasefile, IDataSource } from '@detective.solutions/shared/data-access';

function randomDate() {
  const start = new Date(2021, 0, 1);
  const end = new Date();
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toDateString();
}

export const DUMMY_CASEFILE_DATA: ICasefile[] = [
  {
    id: '1',
    title: 'Sales Forecast',
    description:
      'The topic centres around the features relevant for predicting sales volumes for mid-sized clients in EMEA. Historical sales volume over the last 6 months and outstanding invoices are considered trusted predictors for repurchase likelihoods. Both attributes are in tables OP1 and P73 of the data warehouse.',
    imageSrc: '',
    author: { email: 'cathy.smith@detective.solutions', firstname: 'Cathy', lastname: 'Smith' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '2',
    title: 'Lead Generation',
    description:
      'The topic centres around how to profile unknown customers visiting the Webshop. Cookie and market basket data stored in ECAP are discussed as feasible traces for initial qualification.',
    imageSrc: '',
    author: { email: 'john.doe@detective.solutions', firstname: 'John', lastname: 'Doe' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '3',
    title: 'Customer Sentiment Analysis',
    description:
      'The topic centres around the evaluation of voice of the customer data to bucket users into sentiment categories. The discussion reveals high sentiment variances coincide with irregular purchase intervals.',
    imageSrc: 'https://docs.microsoft.com/de-de/power-bi/consumer/media/end-user-dashboards/power-bi-dashboard.png',
    author: { email: 'robert.mcgregor@detective.solutions', firstname: 'Robert', lastname: 'McGregor' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '4',
    title: 'Cannibalization Analysis',
    description:
      'The topic centres around which attributes to use for quantifying product similarity between product product ranges ARAGON and PAROS. The discussion qualifies material, primary feature and color as main pointers. Attributes were located in within the product master data system.',
    imageSrc: '',
    author: { email: 'damion.huynh@detective.solutions', firstname: 'Damion', lastname: 'Huynh' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '5',
    title: 'Competitive Product Analysis',
    description:
      'The topic centres around how to quantify similarity between product range ARAGON and the product portfolio of competitor SUNLUSH Ltd to predict switching behavior. The discussion reveals that price, material and decency as the main discriminatory factors for analysis. Column PRICE_L should not be used as values are in local currency. Product launch information is missing for products launched in April and May 2021.',
    imageSrc: '',
    author: { email: 'georgina.kollman@detective.solutions', firstname: 'Georgina', lastname: 'Kollman' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '6',
    title: 'CLV Analysis',
    description:
      'The discussion centers around how to quantify CLV for irregular customers. The discussion reveals that purchase history alone is not sufficient in isolation. Loyalty indicators such as ECOS Webshop visits and newsletter subsections need to be factored in.',
    imageSrc: '',
    author: { email: 'grady.ermelinda@detective.solutions', firstname: 'Grady', lastname: 'Ermelinda' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '7',
    title: 'Optimal Price Prediction',
    description:
      'The topic centres around which time horizon to use to compute price elasticites for the 5 least selling products of the SUKU collection. The discussion reveals that data older than 2019 should not be considered to account for product enhancements shipped ever after 1.1.2019. Table Prod_Suku_f19  contains changes to core features in column fcoR.',
    imageSrc: '',
    author: { email: 'damion.huynh@detective.solutions', firstname: 'Damion', lastname: 'Huynh' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '8',
    title: 'Cross-Selling Analysis',
    description:
      'The topic centres around how to quantify fit for recommendation between items of the appliance product line. The discussion uncovers that purchase history is a reliable predictor for next best offer. Data can be retrieved in system P25.',
    imageSrc: '',
    author: { email: 'roe.gobble@detective.solutions', firstname: 'Roe', lastname: 'Gobble' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '9',
    title: 'Up-Selling Analysis',
    description:
      'The topic centres around how to quantify product compatibility. The discussion uncovers primary key foreign key columns to perform joins and the possibility of 1-to-n relationships.',
    imageSrc: '',
    author: { email: 'grady.ermelinda@detective.solutions', firstname: 'Grady', lastname: 'Ermelinda' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '10',
    title: 'Demand Forecasting',
    description:
      'The topic centres around demand forecasting during Black Friday. The discussion reveals that discount campaign data is needed to scope out sales volume portions useful for prediction. Attributes discount ID is needed to look up campaign characteristics in the DMP.',
    imageSrc: '',
    author: { email: 'roe.gobble@detective.solutions', firstname: 'Roe', lastname: 'Gobble' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '11',
    title: 'Delivery Prediction',
    description:
      'Centres around the predictability of delivery times. The discussion uncovers that logistics data is not adjusted for time zone differences. the attribute del_UTC_offest should be used to quantify delivery times',
    imageSrc: '',
    author: { email: 'lana.gau@detective.solutions', firstname: 'Lana', lastname: 'Gau' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '12',
    title: 'Customer Preference Prediction',
    description:
      'The topic centres around clustering customers into groups. Persona characteristics provided by marketing should be used to initialize cluster centroids.',
    imageSrc: '',
    author: { email: 'ellamae.grant@detective.solutions', firstname: 'Ellamae', lastname: 'Grant' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '13',
    title: 'Supplier Analysis',
    description: '',
    imageSrc: '',
    author: { email: 'lana.gau@detective.solutions', firstname: 'Lana', lastname: 'Gau' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
  {
    id: '14',
    title: 'Voice of the customer',
    description:
      'The topic centres around the use of voice of the customer data for locality assessments. The discussion clarifies that NPS ranges from 0-11. Code 11 stands for non response and has to ne precluded. The non response reason was captured in the CRM In column NPS_na_text.',
    imageSrc: '',
    author: { email: 'batie.lapinski@detective.solutions', firstname: 'Batie', lastname: 'Lapinski' },
    views: Math.floor(Math.random() * 1000),
    lastUpdated: randomDate(),
  },
];

export const DUMMY_DATASOURCE_DATA: IDataSource[] = [
  {
    _id: '1',
    name: 'SAP COPA',
    type: 'sql',
    description:
      'PA stands for profitability analysis. As the name says COPA module in SAP acts as a strategic & financial reporting tool for analyzing the profitability based on different segments. The segments can be based on different user inputs like country wise, customer wise product wise etc. So an organization can easily analyse the profit output based on the data from SD, MM & CO module',
    lastUpdated: randomDate(),
  },
  {
    _id: '2',
    name: 'SAP KNA1',
    type: 'azureBlob',
    description:
      'KNA1 is a standard SAP Table which is used to store General Data in Customer Master data and is available within R/3 SAP systems depending on the version and release level.',
    lastUpdated: randomDate(),
  },
  {
    _id: '3',
    name: 'Order Main',
    type: 'excel',
    description:
      'The table is based on the AUFK from the standard SAP ERP and belongs to KAUF. You will find the most important information about orders here.',
    lastUpdated: randomDate(),
  },
  {
    _id: '4',
    name: 'Cost Center Master Data',
    type: 'awsBlob',
    description:
      'A standard table in SAP R3 ERP systems. It is a joined version holding all relevant information for cost center views.',
    lastUpdated: randomDate(),
  },
  {
    _id: '5',
    name: 'Social Media Tracking',
    type: 'excel',
    description: 'An aggregated view holding information about CTA for a given lead by channel.',
    lastUpdated: randomDate(),
  },
  {
    _id: '6',
    name: 'SAP POSRetailLineItem',
    type: 'awsBlob',
    description: 'Holds information about all Items sold in a Retail process.',
    lastUpdated: randomDate(),
  },
  {
    _id: '7',
    name: 'SAP POSRetailLineTrans',
    type: 'azureBlob',
    description: 'Is an overview of transactions. Each transaction is just a header and can contain multiple items.',
    lastUpdated: randomDate(),
  },
];

import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { DatabaseService } from './database.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('DatabaseService', () => {
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [DGraphGrpcClientModule.register({ stubs: [{ address: 'test' }], debug: true })],
      providers: [DatabaseService],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);

    // Disable logger for test runs
    databaseService.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(databaseService).toBeTruthy();
  });

  describe('getCasefileDataById', () => {
    const testCasefileData = {
      id: uuidv4(),
      title: 'testCasefile',
      tableObjects: [],
    };

    const getCasefileByIdQuery = `
      query casefileData($id: string) {
        casefileData(func: eq(Casefile.xid, $id)) {
          id: Casefile.xid
          title: Casefile.title
          tableObjects: Casefile.tableObjects
            {
              xid: TableObject.xid
              name: TableObject.name
              layout: TableObject.layout {
                x: TableNodeLayout.x
                y: TableNodeLayout.y
                width: TableNodeLayout.width
                height: TableNodeLayout.height
              }
            }
        }
      }
    `;

    it('should return a Casefile object with all mandatory properties', async () => {
      const sendQuerySpy = jest.spyOn(DatabaseService.prototype as any, 'sendQuery').mockResolvedValue({
        casefileData: [testCasefileData],
      });

      const res = await databaseService.getCasefileById(testCasefileData.id);

      expect(res).toBe(testCasefileData);
      expect(sendQuerySpy).toBeCalledTimes(1);
      expect(sendQuerySpy).toBeCalledWith(getCasefileByIdQuery, {
        $id: testCasefileData.id,
      });
    });

    it('should return null if the database query returns an empty response', async () => {
      const sendQuerySpy = jest.spyOn(DatabaseService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await databaseService.getCasefileById(testCasefileData.id);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the database response misses the "casefileData" property', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ testCasefileData });

      const getCasefileByIdPromise = databaseService.getCasefileById(testCasefileData.id);

      await expect(getCasefileByIdPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if more than one casefile is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ casefileData: [testCasefileData, testCasefileData] });

      const getCasefileByIdPromise = databaseService.getCasefileById(testCasefileData.id);

      await expect(getCasefileByIdPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should return null if no casefile is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ casefileData: [] });

      const res = await databaseService.getCasefileById(testCasefileData.id);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the validation for the incoming Casefile object fails', async () => {
      const modifiedCasefile = testCasefileData;
      modifiedCasefile.id = ''; // id should not be empty
      modifiedCasefile.title = undefined; // title should be defined

      const sendQuerySpy = jest
        .spyOn(DatabaseService.prototype as any, 'sendQuery')
        .mockResolvedValue({ casefileData: [modifiedCasefile] });

      const getCasefileByIdPromise = databaseService.getCasefileById(testCasefileData.id);

      await expect(getCasefileByIdPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });
  });
});

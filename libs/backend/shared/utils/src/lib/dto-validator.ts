import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { validate } from 'class-validator';

export const validateDto = async (
  targetClass: ClassConstructor<unknown>,
  inputObject: Record<string, any>,
  logger: Logger,
  errorToThrow = InternalServerErrorException
): Promise<any> => {
  const classInstance = plainToInstance(targetClass, inputObject) as Record<string, unknown>;
  const errors = await validate(classInstance, { forbidUnknownValues: true });
  if (errors.length > 0) {
    logger.error(errors);
    throw new errorToThrow();
  }
  return instanceToPlain(classInstance);
};

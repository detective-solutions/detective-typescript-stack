import { IMessageContext, MessageEventType, UserRole } from '@detective.solutions/shared/data-access';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class MessageContextDTO implements IMessageContext {
  @IsEnum(MessageEventType)
  @IsNotEmpty()
  eventType!: MessageEventType;

  @MaxLength(254)
  @IsNotEmpty()
  @IsString()
  tenantId!: string;

  @MaxLength(254)
  @IsNotEmpty()
  @IsString()
  casefileId!: string;

  @MaxLength(254)
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  userRole!: UserRole;

  @MaxLength(254)
  @ValidateIf((nodeId) => nodeId !== '')
  @IsString()
  @IsOptional()
  nodeId!: string;

  @IsNumber()
  @IsNotEmpty()
  timestamp!: number;
}

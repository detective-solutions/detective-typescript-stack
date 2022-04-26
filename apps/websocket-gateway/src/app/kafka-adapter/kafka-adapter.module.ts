import { AuthModule } from '@detective.solutions/backend/auth';
import { KafkaAdapterGateway } from './kafka-adapter.gateway';
import { Module } from '@nestjs/common';

@Module({ imports: [AuthModule], providers: [KafkaAdapterGateway] })
export class KafkaAdapterModule {}

import { Module } from '@nestjs/common';
import { MouseMirrorGateway } from './mouse-mirror.gateway';

@Module({ providers: [MouseMirrorGateway] })
export class MouseMirrorModule {}

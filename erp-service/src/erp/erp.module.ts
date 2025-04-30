import { Module } from '@nestjs/common';
import { ERPService } from './erp.service';

@Module({ providers: [ERPService] })
export class ERPModule {}
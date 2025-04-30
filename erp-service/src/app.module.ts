import { Module } from '@nestjs/common';
import { ERPModule } from './erp/erp.module';

@Module({ imports: [ERPModule] })
export class AppModule {}
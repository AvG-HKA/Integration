import { Module } from '@nestjs/common';
import { ERPService } from './erp/erp.service';

@Module({
  providers: [ERPService],
})
export class AppModule {}
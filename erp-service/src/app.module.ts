import { Module } from '@nestjs/common';
import { ERPService } from './erp/erp.service';
import { ErpController } from './erp/erp.controller';

@Module({
  controllers: [ErpController],
  providers: [ERPService],
})
export class AppModule {}
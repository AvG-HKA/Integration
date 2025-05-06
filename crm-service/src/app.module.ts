import { Module } from '@nestjs/common';
import { CrmService } from './crm/crm.service';

@Module({
  providers: [CrmService],
})
export class AppModule {}
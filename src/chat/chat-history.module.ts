import { Module } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';


@Module({
  imports: [],
  providers: [ChatHistoryService],
  exports: [ChatHistoryService]
})
export class ChatHistoryModule {}
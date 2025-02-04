import { Module } from '@nestjs/common';
import { OpenAiService } from '@blockchain_assistant/src/openAI/openAI.service';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule],
  providers: [OpenAiService],
  exports: [OpenAiService]
})
export class OpenAiModule {}
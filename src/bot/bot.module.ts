
import { Module } from '@nestjs/common';
import { BotService } from '@blockchain_assistant/src/bot/bot.service';
import { CryptoModule } from '@blockchain_assistant/src/crypto/crypto.module';
import { OpenAiModule } from '@blockchain_assistant/src/openAI/openAI.module';

@Module({
  imports: [CryptoModule, OpenAiModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}

import { Module } from '@nestjs/common';
import { OpenAiService } from '@blockchain_assistant/src/openAI/openAI.service';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from '../crypto/crypto.module';


@Module({
  imports: [ConfigModule, CryptoModule],
  providers: [OpenAiService],
  exports: [OpenAiService]
})
export class OpenAiModule {}
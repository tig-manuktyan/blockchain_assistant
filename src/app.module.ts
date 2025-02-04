
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from '@blockchain_assistant/src/crypto/crypto.module';
import { BotModule } from '@blockchain_assistant/src/bot/bot.module';
import { OpenAiModule } from '@blockchain_assistant/src/openAI/openAI.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        API_KEY: Joi.string().required(),
        BOT_TOKEN: Joi.string().required(),
      }),
    }),
    TelegrafModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const token = configService.get<string>('BOT_TOKEN');
        if (!token) {
          throw new Error('BOT_TOKEN environment variable is required!');
        }
        return {
          token,
        };
      },
      inject: [ConfigService],
    }),
    CryptoModule,
    BotModule,
    OpenAiModule
  ],
  providers: [],
})
export class AppModule {}

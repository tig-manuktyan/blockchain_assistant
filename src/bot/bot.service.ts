import { Injectable, Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { Start, Update, Command, Hears, Ctx } from 'nestjs-telegraf';
import { OpenAiService } from '@blockchain_assistant/src/openAI/openAI.service';
import { CryptoService } from '@blockchain_assistant/src/crypto/crypto.service';
import { TELEGRAM_TEXTS } from '@blockchain_assistant/src/constants';

@Update()
@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    private readonly cryptoService: CryptoService,
    private readonly openAiService: OpenAiService,
  ) { }

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    await ctx.reply(TELEGRAM_TEXTS.START);
  }

  @Hears(/.*/)
  async handleMessage(@Ctx() ctx: Context) {
    const input = ctx?.message?.['text']?.trim();
    const userId = ctx.message?.from.id || ctx.message?.chat.id || 1 
    if (!input) {
      return await ctx.reply('Пожалуйста, введите текст.');
    }

    try {
      const answer = await this.openAiService.ask(input, userId) as string;
      await ctx.reply(answer)
    } catch (error) {
      this.logger.error(`Ошибка при обработке запроса "${input}":`, error);
      await ctx.reply('Извините, произошла ошибка при обработке вашего запроса.');
    }
  }

  @Command('help')
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.reply(TELEGRAM_TEXTS.HELP);
  }
}

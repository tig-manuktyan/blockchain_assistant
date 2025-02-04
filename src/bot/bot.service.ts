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
  ) {}

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    await ctx.reply(TELEGRAM_TEXTS.START);
  }

  @Hears(/.*/)
  async handleMessage(@Ctx() ctx: Context) {
    const input = ctx?.message?.['text'].trim();

    try {
      const coin = await this.cryptoService.findCoin(input);
      if (coin) {
        const price = await this.cryptoService.getPriceById(coin.id);
        if (price !== null) {
          return await ctx.reply(
            `Текущая цена для "${coin.name}" (${coin.symbol.toUpperCase()}): ${price} USD. Что-то еще?`,
          );
        } else {
          await ctx.reply('Не удалось получить цену, попробуйте позже.');
        }
      }
    } catch (error) {
      this.logger.error(`Ошибка при обработке крипто-запроса "${input}":`, error);
    }

    try {
      const answer = await this.openAiService.ask(input);
      await ctx.reply(answer);
    } catch (error) {
      this.logger.error(`Ошибка при обработке Deepseek запроса "${input}":`, error);
      await ctx.reply('Извините, произошла ошибка при обработке вашего запроса.');
    }
  }

  @Command('help')
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.reply(TELEGRAM_TEXTS.HELP);
  }
}

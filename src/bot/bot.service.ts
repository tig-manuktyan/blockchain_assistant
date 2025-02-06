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

    if (!input) {
      return await ctx.reply('Пожалуйста, введите текст.');
    }

    try {
      const answer = await this.openAiService.ask(input) as string;
      const condition = this.parseAnswer(answer);
      console.log(condition,"conditioncondition");
      
      if (condition?.type === 'crypto') {
        return await this.handleCryptoRequest(ctx, condition);
      } else {
        return await this.handleGeneralRequest(ctx, input);
      }
    } catch (error) {
      this.logger.error(`Ошибка при обработке запроса "${input}":`, error);
      await ctx.reply('Извините, произошла ошибка при обработке вашего запроса.');
    }
  }

  private parseAnswer(answer: string) {
    try {
      return JSON.parse(answer);
    } catch (error) {
      this.logger.error('Ошибка при разборе ответа от OpenAI:', error);
      return null;
    }
  }

  private async handleCryptoRequest(ctx: Context, condition: any) {
    try {
      const coin = await this.cryptoService.findCoin(condition?.symbol ?? '');
      if (coin) {
        const price = await this.cryptoService.getPriceById(coin.id);
        if (price !== null) {
          await ctx.reply(condition.lang == "en" ?
            `Current price for"${coin.name}" (${coin.symbol.toUpperCase()}): ${price} USD. Something else?`
            :
            `Текущая цена для "${coin.name}" (${coin.symbol.toUpperCase()}): ${price} USD. Что-то еще?`,
          );
        } else {
          await ctx.reply(condition.lang == "en" ? "Unable to get price, please try again later." : 'Не удалось получить цену, попробуйте позже.');
        }
      }
    } catch (error) {
      this.logger.error(`Ошибка при обработке крипто-запроса:`, error);
      await ctx.reply(condition.lang == "en" ? "Unable to process cryptocurrency request." : 'Не удалось обработать запрос о криптовалюте.');
    }
  }

  private async handleGeneralRequest(ctx: Context, input: string) {
    try {
      const askCorrect = await this.openAiService.askCorrect(input) as string;
      await ctx.reply(askCorrect);
    } catch (error) {
      this.logger.error('Ошибка при обработке запроса:', error);
      // await ctx.reply('Не удалось получить ответ, попробуйте позже.');
    }
  }

  @Command('help')
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.reply(TELEGRAM_TEXTS.HELP);
  }
}


import { Module } from '@nestjs/common';
import { CryptoService } from '@blockchain_assistant/src/crypto/crypto.service';

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}

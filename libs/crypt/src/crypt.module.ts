import { Module } from '@nestjs/common';
import { CryptService } from '@app/crypt/crypt.service';

@Module({
  providers: [CryptService],
  exports: [CryptService],
})
export class CryptModule {}

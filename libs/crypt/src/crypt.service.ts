import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptService {
  private readonly logger = new Logger(CryptService.name);
  private readonly salt = 5;
  constructor() {}

  async crypt(value: string): Promise<string> {
    try {
      if (!value || value.length === 0) {
        throw new Error('Valore non valido per la crittografia');
      }
      return await bcrypt.hash(value, this.salt);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Errore sconosciuto durante la crittografia';
      this.logger.error(`Errore durante la crittografia: ${errorMessage}`);
      throw new Error(`Impossibile crittografare il valore: ${errorMessage}`);
    }
  }

  async compare(clearValue: string, criptedValue: string): Promise<boolean> {
    try {
      if (
        !clearValue ||
        !criptedValue ||
        clearValue.length === 0 ||
        criptedValue.length === 0
      ) {
        this.logger.warn(
          'Parametri non validi per il confronto delle password',
        );
        return false;
      }
      return await bcrypt.compare(clearValue, criptedValue);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Errore sconosciuto durante il confronto';
      this.logger.error(
        `Errore durante il confronto delle password: ${errorMessage}`,
      );
      return false;
    }
  }
}

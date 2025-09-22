import { HttpStatus } from '@nestjs/common';

export class CustomException extends Error {
  private _payload: Record<string, unknown> | undefined;
  private errorCode: string | undefined;
  private _httpStatusCode: HttpStatus | undefined;

  constructor(
    message: string,
    errorCode?: string,
    payload?: Record<string, unknown>,
  ) {
    super(message);
    this.errorCode = errorCode;
    this._payload = payload || {};

    this.name = CustomException.name;
    Object.setPrototypeOf(this, CustomException.prototype);
  }

  set payload(newPayload: Record<string, unknown>) {
    this._payload = newPayload || {};
  }
  get payload(): Record<string, unknown> | undefined {
    return this._payload;
  }

  getErrorCode(): string | undefined {
    return this.errorCode;
  }

  set httpStatusCode(statusCode: HttpStatus) {
    this._httpStatusCode = statusCode;
  }

  get httpStatusCode(): HttpStatus | undefined {
    return this._httpStatusCode;
  }
}

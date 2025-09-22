import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { CustomException } from '@app/core';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * Interface for HTTP exception response
 */
export interface HttpExceptionResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

export type ErrorResponse = {
  statusCode: number;
  message: string;
  details: Record<string, unknown>;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;
    //const correlationId = request.correlationId || '';
    const correlationId = '';

    // Get HTTP status
    const httpStatus = this.getHttpStatus(exception);

    // Transform exception to structured format
    const errorResponse = this.getErrorResponse(exception, path, correlationId);

    // Send response with snake_case transformation
    const serializedResponse = instanceToPlain(errorResponse, {
      excludeExtraneousValues: true,
    });
    this.logger.debug('Sending error response', serializedResponse);
    httpAdapter.reply(ctx.getResponse(), serializedResponse, httpStatus);
  }

  /**
   * Get HTTP status code from exception
   */
  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    if (
      exception instanceof CustomException &&
      exception.httpStatusCode != undefined
    ) {
      return exception.httpStatusCode;
    }

    // Default to internal server error for unknown exceptions
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Transform exception to structured error format
   */
  private getErrorResponse(
    exception: unknown,
    path: string,
    correlationId?: string,
  ): ErrorResponse {
    let message: string;
    let payload: Record<string, unknown> | undefined;
    const status = this.getHttpStatus(exception);

    // Determine error code and message based on exception type
    if (exception instanceof CustomException) {
      // Custom exception with error code
      message = exception.message || '';
      payload = exception.payload;
    } else if (exception instanceof HttpException) {
      // Standard HTTP exception
      const response = exception.getResponse();

      // Extract message from response
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const httpResponse = response as HttpExceptionResponse;
        message =
          httpResponse.message || httpResponse.error || 'An error occurred';
      } else {
        message = 'An error occurred';
      }
    } else {
      // Unknown exception
      message =
        exception instanceof Error
          ? exception.message
          : 'Unknown error occurred';

      // Add stack trace in development
      if (process.env.NODE_ENV === 'development') {
        payload = {
          stack: exception instanceof Error ? exception.stack : undefined,
        };
      }
    }

    // Build structured error response
    return {
      statusCode: status,
      message,
      details: {
        path,
        timestamp: new Date().toISOString(),
        correlationId: correlationId || '',
        ...payload,
      },
    } as ErrorResponse;
  }
}

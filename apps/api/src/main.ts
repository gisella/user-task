import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { Logger as PinoLogger, LoggerErrorInterceptor } from 'nestjs-pino';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { Server } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    bufferLogs: true,
    cors: true,
  });

  app.useLogger(app.get(PinoLogger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // if unknown property, will be ignored
      forbidNonWhitelisted: true, // if unknown property, will throw an error
      transform: true, // convert params with dto to a class instance of that dto for more type safety
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const globalPrefix = '/api';
  app.setGlobalPrefix(globalPrefix, {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: 'health/', method: RequestMethod.GET },
    ],
  });

  const port = process.env.API_PORT || 3000;

  const swaggerConfig = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('API for managing leads and lead-related operations')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Use /api/auth/login with username and password to obtain a JWT. Then click Authorize and paste the token as: Bearer <token>.',
        in: 'header',
      },
      'bearer',
    )
    .addSecurityRequirements('bearer')
    .addServer(`http://localhost:${port}${globalPrefix}`, 'Development server')
    .addServer(
      `https://api.yourdomain.com/${globalPrefix}`,
      'Production server',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
    },
  });

  // Graceful shutdown handling
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, () => {
      const logger = app.get(PinoLogger);
      logger.log(`Received ${signal}, starting graceful shutdown...`);

      app
        .close()
        .then(() => {
          logger.log('Application closed successfully');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        });
    });
  });

  await app.listen(port, '0.0.0.0');

  const logger = app.get(PinoLogger);
  const httpServer = app.getHttpServer() as Server;
  httpServer.on('listening', () => {
    logger.log(
      `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
    logger.log(
      `📚 Swagger documentation is available at: http://localhost:${port}/docs`,
    );
    logger.log(`🏥 Health check available at: http://localhost:${port}/health`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

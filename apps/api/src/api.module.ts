import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { UserController, AuthController } from './controllers';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PinoLogModule } from '@app/logger';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { CoreModule } from '@app/core';
import { TaskController } from './controllers/task.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PinoLogModule.forRoot({
      appName: process.env.APP_NAME || 'api',
      node_env: process.env.NODE_ENV || 'development',
    }),
    CoreModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  controllers: [UserController, AuthController, TaskController],
})
export class ApiModule {}

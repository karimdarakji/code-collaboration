import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RefreshTokenModule } from './auth/refresh-token.module';
import { SessionsModule } from './sessions/sessions.module';
import { MailerModule } from './mailer/mailer.module';
import { CollabGateway } from './collab/collab.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.MONGODB_URI || ''),
    UsersModule,
    AuthModule,
    RefreshTokenModule,
    SessionsModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService, CollabGateway],
})
export class AppModule {}

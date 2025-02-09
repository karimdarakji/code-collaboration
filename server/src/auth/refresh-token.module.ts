import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokenSchema } from 'src/schemas/refresh-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'RefreshToken', schema: RefreshTokenSchema }])
],
  controllers: [],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}

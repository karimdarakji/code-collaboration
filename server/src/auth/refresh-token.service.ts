import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { RefreshToken, RefreshTokenDocument } from 'src/schemas/refresh-token.schema';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async createRefreshToken(
    userId: Schema.Types.ObjectId,
    token: string,
  ): Promise<RefreshToken> {
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + 3 * 24 * 60 * 60);
    const createdToken = new this.refreshTokenModel({
      token,
      expires,
      user: userId,
    });
    return createdToken.save();
  }

  async findValidRefreshToken(userId: Schema.Types.ObjectId, token: string): Promise<RefreshTokenDocument | null> {
    return this.refreshTokenModel.findOne({
      token,
      user: userId,
      expires: { $gt: new Date() },
    }).exec();
  }

  async deleteRefreshToken(tokenId: Schema.Types.ObjectId): Promise<any> {
    return this.refreshTokenModel.findByIdAndDelete(tokenId).exec();
  }
}
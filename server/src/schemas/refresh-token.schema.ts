import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema()
export class RefreshToken extends Document {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expires: Date;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongoSchema.Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
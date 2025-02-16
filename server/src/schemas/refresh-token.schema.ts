import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema, Types } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken extends Document {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expires: Date;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongoSchema.Types.ObjectId;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
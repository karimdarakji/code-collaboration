import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';

export type SessionDocument = Session & Document;

export enum SessionVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum SessionRole {
  READ_ONLY = 'read-only',
  READ_WRITE = 'read-write',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

@Schema({ _id: false })
export class Invitation {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true, enum: InvitationStatus, default: InvitationStatus.PENDING })
  status: InvitationStatus;

  @Prop({ required: true })
  token: string;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);

@Schema({ timestamps: true })
export class Session {
  @Prop({ unique: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  participants: Types.ObjectId[];

  @Prop({ required: true, enum: SessionVisibility, default: SessionVisibility.PUBLIC })
  visibility: SessionVisibility;

  @Prop({ type: [InvitationSchema], default: [] })
  invitations: Invitation[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);

SessionSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});
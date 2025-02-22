import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  InvitationStatus,
  Session,
  SessionDocument,
} from 'src/schemas/session.schema';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private readonly mailerService: MailerService,
  ) {}

  async createSession(
    createSessionDto: CreateSessionDto,
    userId: string,
  ): Promise<Session> {
    const session = new this.sessionModel({
      ...createSessionDto,
      createdBy: userId,
      participants: [userId],
      // The creator gets read-write rights by default (logic can be extended later)
    });
    return session.save();
  }

  async deleteSession(sessionId: string, userId: string) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.createdBy.toString() !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this session',
      );
    }

    await this.sessionModel.deleteOne({ _id: sessionId });
    return session;
  }

  async inviteUser(
    sessionId: string,
    createInvitationDto: CreateInvitationDto,
    inviterId: string,
  ): Promise<Session> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    // Only allow if the inviter is a participant.
    if (!session.participants.includes(new Types.ObjectId(inviterId))) {
      throw new ForbiddenException('Not authorized to invite');
    }
    // Create a unique invitation token.
    const token = uuidv4();
    const invitation = {
      email: createInvitationDto.email,
      token,
      status: InvitationStatus.PENDING,
    };
    session.invitations.push(invitation);
    const updatedSession = await session.save();

    // Send an email to the invitee.
    const invitationLink = `${process.env.ORIGIN}/sessions/${session._id}?inviteToken=${token}`;
    await this.mailerService.sendInvitationEmail(
      createInvitationDto.email,
      invitationLink,
    );

    return updatedSession;
  }

  async removeInvitation(
    sessionId: string,
    invitationToken: string,
    requesterId: string,
  ): Promise<Session> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    // Only the creator can remove invitations.
    if (session.createdBy.toString() !== requesterId) {
      throw new ForbiddenException('Not authorized to remove invitations');
    }
    session.invitations = session.invitations.filter(
      (invite) => invite.token !== invitationToken,
    );
    return session.save();
  }

  async leaveSession(sessionId: string, userId: string): Promise<Session> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    // Remove the user from participants.
    session.participants = session.participants.filter(
      (id) => id.toString() !== userId,
    );
    return session.save();
  }

  async getSessionsForUser(userId: string): Promise<Session[]> {
    return this.sessionModel
      .find({ participants: userId })
      .populate('participants')
      .exec();
  }

  async getSessionForUser(
    userId: string,
    sessionId: string,
  ): Promise<Session | null> {
    return this.sessionModel
      .findOne({ participants: userId, _id: sessionId })
      .populate('participants')
      .exec();
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
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
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { MailerService } from '../mailer/mailer.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService,
  ) {}

  async createSession(
    createSessionDto: CreateSessionDto,
    userId: string,
  ): Promise<Session> {
    const session = new this.sessionModel({
      ...createSessionDto,
      createdBy: new Types.ObjectId(userId),
      participants: [new Types.ObjectId(userId)],
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
    userId: string,
    sessionId: string,
    createInvitationDto: CreateInvitationDto,
  ): Promise<Session> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.createdBy.toString() !== userId) {
      throw new UnauthorizedException();
    }
    // Create a unique invitation token.
    const token = uuidv4();
    const invitation = {
      email: createInvitationDto.email,
      token,
      status: InvitationStatus.PENDING,
    };
    if (
      session.invitations.some((inv) => inv.email === createInvitationDto.email)
    ) {
      throw new ConflictException('User already invited');
    }
    // Send an email to the invitee.
    const invitationLink = `${process.env.ORIGIN}/invitations/${token}`;
    await this.mailerService.sendInvitationEmail(
      createInvitationDto.email,
      invitationLink,
    );
    session.invitations.push(invitation);
    const updatedSession = await session.save();
    return updatedSession;
  }

  async removeInvitation(
    sessionId: string,
    email: string,
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
      (invite) => invite.email !== email,
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
      .find({ participants: new Types.ObjectId(userId) })
      .populate('participants')
      .exec();
  }

  async getSessionForUser(
    userId: string,
    sessionId: string,
  ): Promise<Session | null> {
    return this.sessionModel
      .findOne({ participants: new Types.ObjectId(userId), _id: sessionId })
      .populate('participants')
      .exec();
  }

  async updateInvitationStatus(
    sessionId: string,
    token: string,
    updateInvitationDto: UpdateInvitationDto,
  ): Promise<Session> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const invitation = session.invitations.find((inv) => inv.token === token);
    if (!invitation) {
      throw new NotFoundException('Invitation not found or invalid token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('Invitation has already been processed');
    }

    // Update the invitation status
    invitation.status = updateInvitationDto.status;

    // If accepted, add the user to participants
    if (updateInvitationDto.status === InvitationStatus.ACCEPTED) {
      const user = await this.usersService.findOne({ email: invitation.email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user is already a participant
      const userId = (user as { _id: Types.ObjectId })._id.toString();
      if (
        !session.participants.some(
          (participantId) => participantId.toString() === userId,
        )
      ) {
        session.participants.push((user as { _id: Types.ObjectId })._id);
      }
    }

    return session.save();
  }

  async getSessionByInvitationToken(token: string): Promise<Session | null> {
    return this.sessionModel
      .findOne({ 'invitations.token': token })
      .populate('participants')
      .exec();
  }
}

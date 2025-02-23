import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('sessions')
@UseGuards(JwtGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.sessionsService.createSession(
      createSessionDto,
      req.user.userId,
    );
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.sessionsService.getSessionsForUser(req.user.userId);
  }

  @Get(':sessionId')
  async find(
    @Param('sessionId') sessionId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.sessionsService.getSessionForUser(req.user.userId, sessionId);
  }

  @Delete(':sessionId')
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.sessionsService.deleteSession(sessionId, req.user.userId);
  }

  @Post(':sessionId/invite')
  async invite(
    @Param('sessionId') sessionId: string,
    @Body() createInvitationDto: CreateInvitationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.sessionsService.inviteUser(
      req.user.userId,
      sessionId,
      createInvitationDto,
    );
  }

  @Delete(':sessionId/invite/:email')
  async removeInvite(
    @Param('sessionId') sessionId: string,
    @Param('email') email: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.sessionsService.removeInvitation(
      sessionId,
      email,
      req.user.userId,
    );
  }

  @Post(':sessionId/leave')
  async leave(
    @Param('sessionId') sessionId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.sessionsService.leaveSession(sessionId, req.user.userId);
  }
}

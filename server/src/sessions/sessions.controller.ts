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
  async create(@Body() createSessionDto: CreateSessionDto, @Request() req) {
    return this.sessionsService.createSession(createSessionDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req) {
    return this.sessionsService.getSessionsForUser(req.user.userId);
  }

  @Post(':sessionId/invite')
  async invite(
    @Param('sessionId') sessionId: string,
    @Body() createInvitationDto: CreateInvitationDto,
    @Request() req,
  ) {
    return this.sessionsService.inviteUser(
      sessionId,
      createInvitationDto,
      req.user.id,
    );
  }

  @Delete(':sessionId/invite/:token')
  async removeInvite(
    @Param('sessionId') sessionId: string,
    @Param('token') token: string,
    @Request() req,
  ) {
    return this.sessionsService.removeInvitation(sessionId, token, req.user.id);
  }

  @Post(':sessionId/leave')
  async leave(@Param('sessionId') sessionId: string, @Request() req) {
    return this.sessionsService.leaveSession(sessionId, req.user.id);
  }
}

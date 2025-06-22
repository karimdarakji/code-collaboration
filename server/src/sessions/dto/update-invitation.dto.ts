import { IsNotEmpty, IsEnum } from 'class-validator';
import { InvitationStatus } from 'src/schemas/session.schema';

export class UpdateInvitationDto {
  @IsNotEmpty()
  @IsEnum(InvitationStatus)
  status: InvitationStatus;
}

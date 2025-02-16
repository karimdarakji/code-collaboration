import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateInvitationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
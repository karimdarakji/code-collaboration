import { IsNotEmpty, IsString, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { SessionVisibility } from 'src/schemas/session.schema';

export class CreateSessionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsNotEmpty()
  @IsEnum(SessionVisibility)
  visibility: SessionVisibility;
}
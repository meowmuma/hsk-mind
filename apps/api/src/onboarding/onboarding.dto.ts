import { HskCode } from "@prisma/client";
import { IsEnum, IsString, Length, Matches } from "class-validator";

export class CompleteOnboardingDto {
  @IsString()
  @Length(2, 30)
  @Matches(/^[\p{L}\p{N} _-]+$/u)
  displayName!: string;

  @IsString()
  @Matches(/^avatar_0[1-4]$/)
  avatarKey!: string;

  @IsEnum(HskCode)
  targetHsk!: HskCode;
}

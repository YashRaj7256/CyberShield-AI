import { IsString, IsOptional, IsDefined } from 'class-validator';

export class UpdatePlatformSettingDto {
  @IsString()
  key: string;

  @IsDefined()
  value: any;

  @IsOptional()
  @IsString()
  category?: string;
}

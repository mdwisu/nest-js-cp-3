import { IsOptional, IsString } from 'class-validator';

export class QueryItemDto {
  @IsString()
  @IsOptional()
  nama: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsString()
  @IsOptional()
  category: string;
}

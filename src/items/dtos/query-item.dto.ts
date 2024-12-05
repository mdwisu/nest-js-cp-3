import { IsString } from 'class-validator';

export class QueryItemDto {
  @IsString()
  nama: string;

  @IsString()
  location: string;

  @IsString()
  category: string;
}

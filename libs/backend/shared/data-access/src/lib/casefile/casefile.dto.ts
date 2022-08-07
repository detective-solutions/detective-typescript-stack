import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ICasefile } from '@detective.solutions/shared/data-access';

export class Casefile implements ICasefile {
  @MaxLength(254)
  @IsNotEmpty()
  @IsString()
  id: string;

  @MaxLength(254)
  @IsNotEmpty()
  @IsString()
  title: string;

  tableObjects: any; // TODO: Define backend node types
}

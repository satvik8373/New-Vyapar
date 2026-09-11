export type TileType = 
  | 'START' 
  | 'PROPERTY' 
  | 'BANK' 
  | 'TAX' 
  | 'EVENT' 
  | 'SPECIAL';

export type PropertyCategory = 
  | 'TEXTILE'
  | 'DIAMOND'
  | 'HERITAGE'
  | 'INDUSTRY'
  | 'PORT'
  | 'TECH'
  | 'SPECIAL';

export interface TileData {
  id: number;
  name: string;
  gujaratiName: string;
  type: TileType;
  position: number;
  price: number;
  baseRent: number;
  category: PropertyCategory;
  color: string;
  description: string;
  /** Index into the 4x4 landmark_icons spritesheet (0-15, row-major) */
  iconFrame: number;
  ownerId?: string | null;
}

import type { NutritionalInfo } from ".";

export interface Supplement {
  id: string;
  name: string;
  description?: string;
  type?: string;
  tags?: string[];
  dosage?: string;
  timing?: string;
  nutritionalInfo?: NutritionalInfo;
  benefits?: string[];
  imageUrl?: string;
  brand?: string;
  price?: number;
  link?: string;
}

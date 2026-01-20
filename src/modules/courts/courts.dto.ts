import { Decimal } from '@prisma/client/runtime/client';
export class CourtDto {
  id: string;
  name: string;
  rating: number | null;
  hourlyPrice: number; // Prisma Decimal serialized as string
  eventSurcharge?: number | null;
  isAvailable: boolean;
  isIndoor: boolean;
  categories?: { name: string }[];
  facilities?: { name: string }[];
  images?: { imageUrl: string }[];
  createdAt: Date;
  updatedAt: Date;
  address: string;
}

export interface CourtQueryResult {
  images: {
    imageUrl: string;
  }[];
  categories: {
    category: {
      name: string;
    };
  }[];
  facilities: {
    facility: {
      id: number;
      name: string;
    };
  }[];
  id: string;
  name: string;
  rating: number | null;
  hourlyPrice: Decimal | number;
  eventSurcharge: Decimal | null | number;
  isAvailable: boolean;
  isIndoor: boolean;
  createdAt: Date;
  updatedAt: Date;
  address: string;
}

export type ProductCardBadgeTone = 'offer' | 'success' | 'accent' | 'warning' | 'neutral';

export type ProductCardVariant = 'spotlight' | 'catalog';

export type ProductCardActionKind = 'link' | 'button';

export interface ProductCardViewModel {
  id: string;
  category: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number | null;
  imageUrl: string;
  badge?: string;
  badgeTone: ProductCardBadgeTone;
  quickSpecs: string[];
  reviewCount?: number;
  discountValue?: number | null;
}

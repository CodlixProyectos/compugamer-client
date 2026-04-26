export interface Product {
  id: string;
  category: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  specs: { [key: string]: string };
  badge?: string;
  badgeClass?: string;
  reviews?: number;
}

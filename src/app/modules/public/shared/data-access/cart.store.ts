import { Injectable, computed, signal } from '@angular/core';
import { ProductCardViewModel } from '../ui/product-card/product-card.types';

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartStore {
  private readonly itemsState = signal<CartItem[]>([]);

  readonly items = this.itemsState.asReadonly();
  readonly totalItems = computed(() =>
    this.itemsState().reduce((total, item) => total + item.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this.itemsState().reduce((total, item) => total + (item.price * item.quantity), 0)
  );
  readonly isEmpty = computed(() => this.itemsState().length === 0);

  addProduct(product: ProductCardViewModel): void {
    this.itemsState.update((items) => {
      const existingItem = items.find((item) => item.id === product.id);

      if (existingItem) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...items,
        {
          id: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity: 1
        }
      ];
    });
  }

  increment(id: string): void {
    this.itemsState.update((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  decrement(id: string): void {
    this.itemsState.update((items) =>
      items.flatMap((item) => {
        if (item.id !== id) {
          return [item];
        }

        if (item.quantity <= 1) {
          return [];
        }

        return [{ ...item, quantity: item.quantity - 1 }];
      })
    );
  }

  remove(id: string): void {
    this.itemsState.update((items) => items.filter((item) => item.id !== id));
  }

  clear(): void {
    this.itemsState.set([]);
  }
}

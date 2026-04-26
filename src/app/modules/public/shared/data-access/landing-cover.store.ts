import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export interface LandingCoverSlot {
  id: string;
  title: string;
  description: string;
  variant: 'wide' | 'standard';
  referenceImageUrl: string;
  recommendedSize: string;
  alt: string;
}

export interface LandingCoverSlide {
  imageUrl: string;
  alt: string;
}

export const LANDING_MAIN_COVER_SLIDES: LandingCoverSlide[] = [
  {
    imageUrl: '/IMAGENES/banner-1.png',
    alt: 'Banner principal de la tienda con promocion destacada'
  },
  {
    imageUrl: '/IMAGENES/banner-2.png',
    alt: 'Banner principal con productos destacados de tecnologia'
  },
  {
    imageUrl: '/IMAGENES/banner-4.png',
    alt: 'Banner principal con ofertas especiales de la tienda'
  }
];

const LANDING_COVER_SLOTS: LandingCoverSlot[] = [
  {
    id: 'main-cover',
    title: 'Hero principal',
    description: 'Si subes una imagen aquí, reemplaza el carrusel del inicio por una portada fija.',
    variant: 'wide',
    referenceImageUrl: '/IMAGENES/banner-1.png',
    recommendedSize: '1600 x 700 px',
    alt: 'Portada principal de la tienda con promocion destacada'
  },
  {
    id: 'promo-cover',
    title: 'Banner de promoción',
    description: 'Ideal para campañas cortas, ofertas semanales o combos destacados.',
    variant: 'standard',
    referenceImageUrl: '/IMAGENES/oferta-01.png',
    recommendedSize: '1200 x 900 px',
    alt: 'Portada de promocion con ofertas gamer y combos destacados'
  },
  {
    id: 'category-cover',
    title: 'Banner de categoría',
    description: 'Sirve para empujar una línea concreta como laptops, audio o accesorios.',
    variant: 'standard',
    referenceImageUrl: '/IMAGENES/oferta-2.png',
    recommendedSize: '1200 x 900 px',
    alt: 'Portada de categoria para laptops gamer y accesorios'
  }
];

@Injectable({
  providedIn: 'root'
})
export class LandingCoverStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'ts-landing-cover-overrides';
  private readonly coverOverridesState = signal<Record<string, string>>(this.readInitialState());

  readonly coverSlots = LANDING_COVER_SLOTS;
  readonly coverOverrides = this.coverOverridesState.asReadonly();

  coverPreview(slotId: string): string | null {
    return this.coverOverridesState()[slotId] ?? null;
  }

  async saveCover(slotId: string, file: File): Promise<void> {
    const nextCover = await this.readFileAsDataUrl(file);

    this.coverOverridesState.update((state) => {
      const nextState = {
        ...state,
        [slotId]: nextCover
      };

      this.persist(nextState);
      return nextState;
    });
  }

  clearCover(slotId: string): void {
    this.coverOverridesState.update((state) => {
      if (!state[slotId]) {
        return state;
      }

      const nextState = { ...state };
      delete nextState[slotId];
      this.persist(nextState);
      return nextState;
    });
  }

  private readInitialState(): Record<string, string> {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }

    const rawState = localStorage.getItem(this.storageKey);

    if (!rawState) {
      return {};
    }

    try {
      const parsedState = JSON.parse(rawState) as Record<string, unknown>;

      return Object.entries(parsedState).reduce<Record<string, string>>((accumulator, [key, value]) => {
        if (typeof value === 'string' && value.length > 0) {
          accumulator[key] = value;
        }

        return accumulator;
      }, {});
    } catch {
      return {};
    }
  }

  private persist(state: Record<string, string>): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (Object.keys(state).length === 0) {
      localStorage.removeItem(this.storageKey);
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('No se pudo leer la imagen seleccionada.'));
      };

      reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer la imagen seleccionada.'));
      reader.readAsDataURL(file);
    });
  }
}

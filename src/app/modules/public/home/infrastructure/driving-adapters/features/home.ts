import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { GetProductsUseCase } from '../../../domain/use-cases/get-products.use-case';
import { Product } from '../../../domain/entities/product.entity';
import { AuthModalStore } from '../../../../shared/data-access/auth-modal.store';
import { CartStore } from '../../../../shared/data-access/cart.store';
import { LandingCoverSlot, LandingCoverStore, LANDING_MAIN_COVER_SLIDES } from '../../../../shared/data-access/landing-cover.store';
import { ProductCardComponent } from '../../../../shared/ui/product-card/product-card';
import { ProductCardViewModel } from '../../../../shared/ui/product-card/product-card.types';
import { ScrollRevealDirective } from './scroll-reveal.directive';

type BadgeTone = 'offer' | 'success' | 'accent' | 'warning' | 'neutral';

interface NavItem { label: string; href?: string; routerLink?: string; active?: boolean; hasChevron?: boolean; }
interface CountdownUnit { value: string; label: string; }
interface IconInfo { icon: SafeHtml; title: string; desc: string; }
interface FooterSection { title: string; links: { label: string; href: string }[]; }
interface SocialLink { label: string; short: string; }
interface SpotlightProduct extends Product { badgeTone: BadgeTone; quickSpecs: string[]; discountValue: number | null; }

@Component({
  selector: 'app-home',
  imports: [CommonModule, NgOptimizedImage, RouterLink, ProductCardComponent, ScrollRevealDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ts-home-page'
  }
})
export class HomeComponent {
  private readonly getProductsUseCase = inject(GetProductsUseCase);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly authModalStore = inject(AuthModalStore);
  private readonly cartStore = inject(CartStore);
  private readonly landingCoverStore = inject(LandingCoverStore);
  private readonly destroyRef = inject(DestroyRef);
  private carouselTimer: ReturnType<typeof setInterval> | null = null;

  readonly flashImageUrl = 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=900&auto=format&fit=crop';
  readonly shippingImageUrl = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&auto=format&fit=crop';
  readonly cartCount = this.cartStore.totalItems;
  readonly footerYear = 2024;
  readonly activeMainCoverSlide = signal(0);
  readonly showCoverEditorOverlay = false;
  readonly spotlightProductIds = ['1', '2', '3', '5', '6'];

  readonly navItems: NavItem[] = [
    { label: 'Inicio', href: '#inicio', active: true },
    { label: 'Catálogo', routerLink: '/catalogo' },
    { label: 'Promociones', href: '#promociones' },
    { label: 'Ofertas', href: '#ofertas' },
    { label: 'Garantías', href: '#garantias' },
    { label: 'Contacto', href: '#contacto' }
  ];

  readonly mainCoverSlides = LANDING_MAIN_COVER_SLIDES;

  readonly coverSlots = this.landingCoverStore.coverSlots;

  readonly trustItems: IconInfo[] = [
    {
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v8H3z"/><path d="M14 10h3l3 3v2h-6z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/></svg>`),
      title: 'Envíos rápidos',
      desc: 'a todo el país'
    },
    {
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.2-2.7 8-7 10-4.3-2-7-5.8-7-10V6l7-3Z"/><path d="m9.5 12 1.8 1.8 3.7-3.8"/></svg>`),
      title: 'Compra 100% segura',
      desc: 'Protegemos tus datos'
    },
    {
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="m8.5 13.5-1.2 7L12 18l4.7 2.5-1.2-7"/></svg>`),
      title: 'Garantía oficial',
      desc: 'en todos los productos'
    },
    {
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13a8 8 0 1 1 16 0"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/></svg>`),
      title: 'Soporte 24/7',
      desc: 'siempre estamos aquí'
    }
  ];

  readonly countdown: CountdownUnit[] = [
    { value: '02', label: 'Días'  },
    { value: '14', label: 'Horas' },
    { value: '37', label: 'Min'   },
    { value: '58', label: 'Seg'   },
  ];

  readonly serviceItems: IconInfo[] = [
    {
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.2-2.7 8-7 10-4.3-2-7-5.8-7-10V6l7-3Z"/><path d="m9.5 12 1.8 1.8 3.7-3.8"/></svg>`),
      title: 'Garantía oficial',
      desc: 'Todos nuestros productos cuentan con garantía'
    },
    {
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11a8 8 0 0 1 13.7-5.7L20 8"/><path d="M21 13a8 8 0 0 1-13.7 5.7L4 16"/><path d="M20 4v4h-4"/><path d="M4 20v-4h4"/></svg>`),
      title: 'Devoluciones fáciles',
      desc: 'Tienes 15 días para devolver tu producto'
    },
    {
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m20 12-8 8-9-9V4h7Z"/><circle cx="7.5" cy="7.5" r="1"/></svg>`),
      title: 'Mejores precios',
      desc: 'Ofertas y promociones exclusivas para ti'
    },
    {
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9Z"/></svg>`),
      title: 'Calidad garantizada',
      desc: 'Solo trabajamos con las mejores marcas'
    }
  ];

  readonly socialLinks: SocialLink[] = [
    { label: 'Facebook', short: 'f' },
    { label: 'Instagram', short: 'ig' },
    { label: 'YouTube', short: 'yt' },
    { label: 'TikTok', short: 'tt' }
  ];

  readonly footerSections: FooterSection[] = [
    {
      title: 'Enlaces',
      links: [
        { label: 'Inicio', href: '#inicio' },
        { label: 'Promociones', href: '#promociones' },
        { label: 'Ofertas', href: '#ofertas' },
        { label: 'Garantías', href: '#garantias' },
        { label: 'Contacto', href: '#contacto' }
      ]
    },
    {
      title: 'Ayuda',
      links: [
        { label: 'Preguntas frecuentes', href: '#garantias' },
        { label: 'Envíos y entregas', href: '#ofertas' },
        { label: 'Devoluciones', href: '#garantias' },
        { label: 'Términos y condiciones', href: '#contacto' },
        { label: 'Política de privacidad', href: '#contacto' }
      ]
    }
  ];

  readonly products = toSignal(this.getProductsUseCase.execute(), {
    initialValue: [] as Product[]
  });

  readonly spotlightProducts = computed<SpotlightProduct[]>(() => {
    const rankedProducts = this.products()
      .map((product) => {
        const discountValue = product.oldPrice != null ? Math.max(product.oldPrice - product.price, 0) : null;
        const promoWeight = product.oldPrice != null ? 3 : product.badgeClass === 'badge-danger' ? 2 : product.badge ? 1 : 0;

        return {
          ...product,
          badgeTone: this.getBadgeTone(product.badgeClass),
          quickSpecs: Object.entries(product.specs)
            .slice(0, 2)
            .map(([label, value]) => `${label}: ${value}`),
          discountValue,
          promoWeight
        };
      })
      .sort((left, right) => {
        if (right.promoWeight !== left.promoWeight) {
          return right.promoWeight - left.promoWeight;
        }

        if ((right.discountValue ?? 0) !== (left.discountValue ?? 0)) {
          return (right.discountValue ?? 0) - (left.discountValue ?? 0);
        }

        return (right.reviews ?? 0) - (left.reviews ?? 0);
      });

    const curatedProducts = this.spotlightProductIds
      .map((id) => rankedProducts.find((product) => product.id === id))
      .filter((product): product is (SpotlightProduct & { promoWeight: number }) => product != null);

    const selectedProducts = curatedProducts.length === this.spotlightProductIds.length
      ? curatedProducts
      : rankedProducts.slice(0, 5);

    return selectedProducts.map(({ promoWeight, ...product }) => product);
  });

  constructor() {
    this.carouselTimer = setInterval(() => {
      if (this.coverPreview('main-cover')) {
        return;
      }

      this.activeMainCoverSlide.update((index) => (index + 1) % this.mainCoverSlides.length);
    }, 4200);

    this.destroyRef.onDestroy(() => {
      if (this.carouselTimer) {
        clearInterval(this.carouselTimer);
      }
    });
  }

  openAuthModal(): void {
    this.authModalStore.open('login');
  }

  addToCart(product: ProductCardViewModel): void {
    this.cartStore.addProduct(product);
  }

  coverPreview(slotId: string): string | null {
    return this.landingCoverStore.coverPreview(slotId);
  }

  coverImage(slot: LandingCoverSlot): string {
    if (slot.id === 'main-cover' && !this.coverPreview(slot.id)) {
      return this.mainCoverSlides[this.activeMainCoverSlide()].imageUrl;
    }

    return this.coverPreview(slot.id) ?? slot.referenceImageUrl;
  }

  coverAlt(slot: LandingCoverSlot): string {
    if (slot.id === 'main-cover' && !this.coverPreview(slot.id)) {
      return this.mainCoverSlides[this.activeMainCoverSlide()].alt;
    }

    return slot.alt;
  }

  isCarouselSlot(slot: LandingCoverSlot): boolean {
    return slot.id === 'main-cover' && !this.coverPreview(slot.id);
  }

  setMainCoverSlide(index: number): void {
    if (index < 0 || index >= this.mainCoverSlides.length) {
      return;
    }

    this.activeMainCoverSlide.set(index);
  }

  clearCover(slotId: string): void {
    this.landingCoverStore.clearCover(slotId);
  }

  onCoverSelected(event: Event, slotId: string): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    void this.landingCoverStore.saveCover(slotId, file);

    if (input) {
      input.value = '';
    }
  }

  private svg(raw: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }

  private getBadgeTone(badgeClass?: string): BadgeTone {
    switch (badgeClass) {
      case 'badge-danger':
        return 'offer';
      case 'badge-success':
        return 'success';
      case 'badge-accent':
        return 'accent';
      case 'badge-warning':
        return 'warning';
      default:
        return 'neutral';
    }
  }
}

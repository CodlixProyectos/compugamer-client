import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { Product } from '../../../../home/domain/entities/product.entity';
import { GetProductByIdUseCase } from '../../../../home/domain/use-cases/get-product-by-id.use-case';
import { GetProductsUseCase } from '../../../../home/domain/use-cases/get-products.use-case';
import { AuthModalStore } from '../../../../shared/data-access/auth-modal.store';
import { CartStore } from '../../../../shared/data-access/cart.store';
import { CartFlightAnimationService } from '../../../../shared/ui/product-card/cart-flight-animation.service';
import { ProductCardComponent } from '../../../../shared/ui/product-card/product-card';
import { ProductCardBadgeTone, ProductCardViewModel } from '../../../../shared/ui/product-card/product-card.types';

interface NavItem { label: string; href?: string; routerLink?: string; active?: boolean; }
interface FooterSection { title: string; links: { label: string; href: string }[]; }
interface SocialLink { label: string; short: string; }

interface DetailProduct extends ProductCardViewModel {
  description: string;
}

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, NgOptimizedImage, RouterLink, ProductCardComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ts-home-page'
  }
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly getProductByIdUseCase = inject(GetProductByIdUseCase);
  private readonly getProductsUseCase = inject(GetProductsUseCase);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly authModalStore = inject(AuthModalStore);
  private readonly cartStore = inject(CartStore);
  private readonly cartFlightAnimationService = inject(CartFlightAnimationService);

  readonly detailProductImage = viewChild<ElementRef<HTMLImageElement>>('detailProductImage');

  readonly cartCount = this.cartStore.totalItems;
  readonly footerYear = 2024;

  readonly navItems: NavItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Categorías', routerLink: '/catalogo', active: true },
    { label: 'Ofertas', href: '/#ofertas' },
    { label: 'Novedades', href: '/#destacados' },
    { label: 'Soporte', href: '/#garantias' },
    { label: 'Contacto', href: '/#contacto' }
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
        { label: 'Inicio', href: '/' },
        { label: 'Categorías', href: '/catalogo' },
        { label: 'Ofertas', href: '/#ofertas' },
        { label: 'Novedades', href: '/#destacados' },
        { label: 'Contacto', href: '/#contacto' }
      ]
    },
    {
      title: 'Ayuda',
      links: [
        { label: 'Preguntas frecuentes', href: '/#garantias' },
        { label: 'Envíos y entregas', href: '/#ofertas' },
        { label: 'Devoluciones', href: '/#garantias' },
        { label: 'Términos y condiciones', href: '/#contacto' },
        { label: 'Política de privacidad', href: '/#contacto' }
      ]
    }
  ];

  readonly supportHighlights = [
    {
      title: 'Entrega rápida',
      description: 'Despacho seguro y seguimiento de tu pedido.',
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v8H3z"/><path d="M14 10h3l3 3v2h-6z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/></svg>`)
    },
    {
      title: 'Pago seguro',
      description: 'Tus datos protegidos en todo momento.',
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.2-2.7 8-7 10-4.3-2-7-5.8-7-10V6l7-3Z"/><path d="m9.5 12 1.8 1.8 3.7-3.8"/></svg>`)
    },
    {
      title: 'Garantía oficial',
      description: 'Soporte posventa con respaldo real.',
      icon: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="m8.5 13.5-1.2 7L12 18l4.7 2.5-1.2-7"/></svg>`)
    }
  ];

  readonly product = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((id) => (id ? this.getProductByIdUseCase.execute(id) : of(null))),
      catchError(() => of(null))
    ),
    { initialValue: null as Product | null }
  );

  readonly allProducts = toSignal(this.getProductsUseCase.execute(), {
    initialValue: [] as Product[]
  });

  readonly detailProduct = computed<DetailProduct | null>(() => {
    const product = this.product();
    return product ? this.toDetailProduct(product) : null;
  });

  readonly relatedProducts = computed<ProductCardViewModel[]>(() => {
    const currentProduct = this.detailProduct();
    if (!currentProduct) {
      return [];
    }

    return this.allProducts()
      .filter((product) => product.id !== currentProduct.id && product.category === currentProduct.category)
      .slice(0, 3)
      .map((product) => this.toCardProduct(product));
  });

  openAuthModal(): void {
    this.authModalStore.open('login');
  }

  addToCart(product: ProductCardViewModel): void {
    this.cartStore.addProduct(product);
  }

  addCurrentProductToCart(): void {
    const product = this.detailProduct();

    if (!product) {
      return;
    }

    this.cartFlightAnimationService.animateFrom(this.detailProductImage()?.nativeElement ?? null);
    this.cartStore.addProduct(product);
  }

  private svg(raw: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }

  private toDetailProduct(product: Product): DetailProduct {
    const discountValue = product.oldPrice != null ? Math.max(product.oldPrice - product.price, 0) : null;

    return {
      ...product,
      oldPrice: product.oldPrice ?? null,
      badgeTone: this.getBadgeTone(product.badgeClass),
      reviewCount: product.reviews ?? 0,
      quickSpecs: Object.entries(product.specs)
        .slice(0, 3)
        .map(([label, value]) => `${label}: ${value}`),
      discountValue
    };
  }

  private toCardProduct(product: Product): ProductCardViewModel {
    return {
      ...product,
      oldPrice: product.oldPrice ?? null,
      badgeTone: this.getBadgeTone(product.badgeClass),
      reviewCount: product.reviews ?? 0,
      quickSpecs: Object.entries(product.specs)
        .slice(0, 2)
        .map(([label, value]) => `${label}: ${value}`),
      discountValue: product.oldPrice != null ? Math.max(product.oldPrice - product.price, 0) : null
    };
  }

  private getBadgeTone(badgeClass?: string): ProductCardBadgeTone {
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

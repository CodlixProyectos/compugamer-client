import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { GetProductsUseCase } from '../../../../home/domain/use-cases/get-products.use-case';
import { Product } from '../../../../home/domain/entities/product.entity';
import { AuthModalStore } from '../../../../shared/data-access/auth-modal.store';
import { CartStore } from '../../../../shared/data-access/cart.store';
import { ProductCardComponent } from '../../../../shared/ui/product-card/product-card';
import { ProductCardViewModel } from '../../../../shared/ui/product-card/product-card.types';

type BadgeTone = 'offer' | 'success' | 'accent' | 'warning' | 'neutral';

interface NavItem { label: string; href?: string; routerLink?: string; active?: boolean; }
interface FooterSection { title: string; links: { label: string; href: string }[]; }
interface SocialLink { label: string; short: string; }
interface CatalogBaseCategory { name: string; description: string; accent: string; svg: SafeHtml; }
interface CatalogCategory extends CatalogBaseCategory { count: number; }
interface CatalogProduct extends Product { badgeTone: BadgeTone; reviewCount: number; quickSpecs: string[]; }

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, NgOptimizedImage, RouterLink, ProductCardComponent],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ts-home-page'
  }
})
export class CatalogComponent {
  private readonly getProductsUseCase = inject(GetProductsUseCase);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly authModalStore = inject(AuthModalStore);
  private readonly cartStore = inject(CartStore);

  readonly cartCount = this.cartStore.totalItems;
  readonly footerYear = 2024;
  readonly selectedCategory = signal('Todas');

  readonly navItems: NavItem[] = [
    { label: 'Inicio', routerLink: '/' },
    { label: 'Catálogo', href: '#catalogo', active: true },
    { label: 'Categorías', href: '#categorias' },
    { label: 'Productos', href: '#productos' },
    { label: 'Contacto', href: '/#contacto' }
  ];

  readonly baseCategories: CatalogBaseCategory[] = [
    { name: 'Mouses', description: 'Precisión para juego y trabajo.', accent: '#2563eb', svg: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="7"/><line x1="12" y1="2" x2="12" y2="10"/></svg>`) },
    { name: 'Teclados', description: 'Mecánicos, RGB y compactos.', accent: '#f59e0b', svg: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6.01" y2="10" stroke-width="2.5" stroke-linecap="round"/><line x1="10" y1="10" x2="10.01" y2="10" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="10" x2="14.01" y2="10" stroke-width="2.5" stroke-linecap="round"/><line x1="18" y1="10" x2="18.01" y2="10" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="14" x2="16" y2="14" stroke-linecap="round"/></svg>`) },
    { name: 'Pantallas', description: 'Monitores gaming y curvos.', accent: '#0ea5e9', svg: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`) },
    { name: 'Tarjetas Gráficas', description: 'Potencia para gaming y render.', accent: '#ef4444', svg: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="7" width="22" height="10" rx="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><line x1="7" y1="7" x2="7" y2="4"/><line x1="12" y1="7" x2="12" y2="4"/><line x1="17" y1="7" x2="17" y2="4"/></svg>`) },
    { name: 'Auriculares', description: 'Audio inmersivo y confort.', accent: '#8b5cf6', svg: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`) },
    { name: 'Procesadores', description: 'Intel y Ryzen de alto nivel.', accent: '#10b981', svg: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="9" width="6" height="6"/><rect x="5" y="5" width="14" height="14" rx="2"/><line x1="9" y1="2" x2="9" y2="5"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="15" y1="2" x2="15" y2="5"/><line x1="9" y1="19" x2="9" y2="22"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="15" y1="19" x2="15" y2="22"/><line x1="2" y1="9" x2="5" y2="9"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="9" x2="22" y2="9"/><line x1="19" y1="12" x2="22" y2="12"/></svg>`) },
    { name: 'Almacenamiento', description: 'SSD NVMe y discos confiables.', accent: '#06b6d4', svg: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6" stroke-width="3" stroke-linecap="round"/><line x1="6" y1="18" x2="6.01" y2="18" stroke-width="3" stroke-linecap="round"/></svg>`) },
    { name: 'Accesorios', description: 'Extras clave para completar tu setup.', accent: '#f97316', svg: this.svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`) }
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

  readonly products = toSignal(this.getProductsUseCase.execute(), {
    initialValue: [] as Product[]
  });

  readonly categoryFilters = computed<CatalogCategory[]>(() =>
    this.baseCategories.map((category) => ({
      ...category,
      count: this.products().filter((product) => product.category === category.name).length
    }))
  );

  readonly catalogProducts = computed<CatalogProduct[]>(() =>
    this.products()
      .filter((product) => this.selectedCategory() === 'Todas' || product.category === this.selectedCategory())
      .map((product) => ({
        ...product,
        badgeTone: this.getBadgeTone(product.badgeClass),
        reviewCount: product.reviews ?? 0,
        quickSpecs: Object.entries(product.specs)
          .slice(0, 2)
          .map(([label, value]) => `${label}: ${value}`)
      }))
  );

  readonly totalProducts = computed(() => this.products().length);

  selectCategory(categoryName: string): void {
    this.selectedCategory.set(categoryName);
  }

  openAuthModal(): void {
    this.authModalStore.open('login');
  }

  addToCart(product: ProductCardViewModel): void {
    this.cartStore.addProduct(product);
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

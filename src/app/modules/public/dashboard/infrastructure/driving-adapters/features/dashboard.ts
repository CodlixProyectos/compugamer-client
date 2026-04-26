import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthSessionStore } from '../../../../shared/data-access/auth-session.store';
import { LandingCoverStore } from '../../../../shared/data-access/landing-cover.store';
import { HomeComponent } from '../../../../home/infrastructure/driving-adapters/features/home';

type DashboardSection = 'overview' | 'stores' | 'orders' | 'inventory' | 'landing' | 'campaigns' | 'alerts';
type InventorySubview = 'dashboard' | 'products';

const DASHBOARD_SECTIONS: DashboardSection[] = ['overview', 'stores', 'orders', 'inventory', 'landing', 'campaigns', 'alerts'];
const INVENTORY_SUBVIEWS: InventorySubview[] = ['dashboard', 'products'];

interface DashboardNavItem {
  id: DashboardSection;
  label: string;
  hint: string;
}

interface InventorySubviewItem {
  id: InventorySubview;
  label: string;
  hint: string;
}

interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  tone: 'amber' | 'blue' | 'green' | 'slate';
}

interface DashboardAction {
  title: string;
  description: string;
  badge: string;
}

interface SalesTrendPoint {
  day: string;
  shortLabel: string;
  total: string;
  relativeHeight: number;
  orders: number;
}

interface SalesChannel {
  label: string;
  share: number;
  amount: string;
  accent: string;
}

interface SalesGoal {
  label: string;
  value: string;
  hint: string;
  progress: number;
  accent: string;
}

interface TopProduct {
  name: string;
  category: string;
  units: number;
  revenue: string;
}

interface OrderQueueItem {
  id: string;
  customer: string;
  store: string;
  total: string;
  status: string;
}

interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  stock: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  price: string;
  location: string;
  lastMovement: string;
  status: 'Critico' | 'Bajo' | 'Estable';
}

interface InventoryCategorySummary {
  label: string;
  units: string;
  share: number;
  hint: string;
  accent: string;
}

interface InventoryRestockItem {
  product: string;
  supplier: string;
  eta: string;
  quantity: string;
  priority: 'Alta' | 'Media' | 'Baja';
}

interface InventoryMovement {
  type: 'Entrada' | 'Salida' | 'Ajuste';
  product: string;
  quantity: string;
  timestamp: string;
  actor: string;
  action: string;
}

interface CampaignItem {
  title: string;
  window: string;
  owner: string;
  status: string;
}

interface ManagedStore {
  name: string;
  city: string;
  manager: string;
  status: string;
  hours: string;
  pendingOrders: number;
  stockHealth: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, HomeComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ts-dashboard-page'
  }
})
export class DashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authSessionStore = inject(AuthSessionStore);
  private readonly landingCoverStore = inject(LandingCoverStore);

  readonly activeSection = signal<DashboardSection>(this.readInitialSection());
  readonly activeInventorySubview = signal<InventorySubview>(this.readInitialInventorySubview());
  readonly landingEditMode = signal(false);
  readonly sessionName = this.authSessionStore.displayName;
  readonly sessionEmail = this.authSessionStore.email;

  readonly navItems: DashboardNavItem[] = [
    { id: 'overview', label: 'Ventas', hint: 'Gráficos y rendimiento' },
    { id: 'orders', label: 'Pedidos', hint: 'Seguimiento del día' },
    { id: 'inventory', label: 'Inventario', hint: 'Stock y catálogo' },
    { id: 'landing', label: 'Landing', hint: 'Portadas del inicio' }
  ];

  readonly inventorySubviewItems: InventorySubviewItem[] = [
    { id: 'dashboard', label: 'Dashboard', hint: 'Stock, reposición y movimientos' },
    { id: 'products', label: 'Productos', hint: 'Listado y estado del catálogo' }
  ];

  readonly landingCoverSlots = this.landingCoverStore.coverSlots;

  readonly salesMetrics: DashboardMetric[] = [
    {
      label: 'Ventas del día',
      value: 'S/ 18,420',
      detail: '+12% frente a ayer',
      tone: 'amber'
    },
    {
      label: 'Pedidos activos',
      value: '27',
      detail: '9 requieren confirmación',
      tone: 'blue'
    },
    {
      label: 'Comprobantes emitidos',
      value: '34',
      detail: 'Boletas y facturas del día',
      tone: 'green'
    },
    {
      label: 'Alertas de stock',
      value: '5',
      detail: 'Procesadores y SSD',
      tone: 'slate'
    }
  ];

  readonly orderMetrics: DashboardMetric[] = [
    {
      label: 'Pedidos del día',
      value: '32',
      detail: '27 ya están en proceso',
      tone: 'amber'
    },
    {
      label: 'Pagos pendientes',
      value: '9',
      detail: 'Esperan validación manual',
      tone: 'blue'
    },
    {
      label: 'Recojos programados',
      value: '11',
      detail: 'Clientes citados para hoy',
      tone: 'green'
    },
    {
      label: 'Despachos observados',
      value: '3',
      detail: 'Requieren seguimiento urgente',
      tone: 'slate'
    }
  ];

  readonly inventoryMetrics: DashboardMetric[] = [
    {
      label: 'Productos activos',
      value: '148',
      detail: 'Catálogo disponible para venta',
      tone: 'amber'
    },
    {
      label: 'Stock crítico',
      value: '12',
      detail: 'Items por debajo del mínimo',
      tone: 'blue'
    },
    {
      label: 'Valor inventario',
      value: 'S/ 412,800',
      detail: 'Costo valorizado en almacén',
      tone: 'green'
    },
    {
      label: 'Reposiciones hoy',
      value: '5',
      detail: 'Órdenes de compra activas',
      tone: 'slate'
    }
  ];

  readonly landingMetrics = computed<DashboardMetric[]>(() => {
    const coverOverrides = this.landingCoverStore.coverOverrides();
    const customCoverCount = this.landingCoverSlots.filter((slot) => !!coverOverrides[slot.id]).length;
    const isHeroCustomized = !!coverOverrides['main-cover'];

    return [
      {
        label: 'Slots editables',
        value: String(this.landingCoverSlots.length),
        detail: 'Hero principal y banners secundarios',
        tone: 'amber'
      },
      {
        label: 'Portadas personalizadas',
        value: String(customCoverCount),
        detail: customCoverCount > 0 ? 'Se están usando imágenes propias' : 'Todo sigue en modo predeterminado',
        tone: 'blue'
      },
      {
        label: 'Hero activo',
        value: isHeroCustomized ? 'Manual' : 'Carrusel',
        detail: isHeroCustomized ? 'La portada fija reemplaza el slider inicial' : 'Se mantiene el carrusel original',
        tone: 'green'
      },
      {
        label: 'Estado visual',
        value: 'Publicado',
        detail: 'Los cambios se reflejan al instante en el inicio',
        tone: 'slate'
      }
    ];
  });

  readonly actions: DashboardAction[] = [
    {
      title: 'Supervisar pedidos',
      description: 'Revisa compras pendientes, pagos por confirmar y entregas del día.',
      badge: 'Operación'
    },
    {
      title: 'Actualizar promociones',
      description: 'Activa campañas, banners y productos que deben empujar la portada.',
      badge: 'Marketing'
    },
    {
      title: 'Controlar inventario',
      description: 'Detecta quiebres de stock y repón las líneas con mayor rotación.',
      badge: 'Stock'
    }
  ];

  readonly weeklySalesSnapshot = {
    total: 'S/ 126,380',
    detail: '+14% frente a la semana pasada'
  };

  readonly salesTrend: SalesTrendPoint[] = [
    {
      day: 'Lunes',
      shortLabel: 'Lun',
      total: 'S/ 14.2k',
      relativeHeight: 56,
      orders: 18
    },
    {
      day: 'Martes',
      shortLabel: 'Mar',
      total: 'S/ 16.1k',
      relativeHeight: 64,
      orders: 21
    },
    {
      day: 'Miércoles',
      shortLabel: 'Mié',
      total: 'S/ 17.4k',
      relativeHeight: 71,
      orders: 23
    },
    {
      day: 'Jueves',
      shortLabel: 'Jue',
      total: 'S/ 19.8k',
      relativeHeight: 83,
      orders: 27
    },
    {
      day: 'Viernes',
      shortLabel: 'Vie',
      total: 'S/ 21.7k',
      relativeHeight: 100,
      orders: 31
    },
    {
      day: 'Sábado',
      shortLabel: 'Sáb',
      total: 'S/ 20.5k',
      relativeHeight: 92,
      orders: 28
    },
    {
      day: 'Domingo',
      shortLabel: 'Dom',
      total: 'S/ 16.7k',
      relativeHeight: 69,
      orders: 20
    }
  ];

  readonly salesChannels: SalesChannel[] = [
    {
      label: 'Tienda física',
      share: 42,
      amount: 'S/ 53,080',
      accent: '#f59e0b'
    },
    {
      label: 'Web',
      share: 31,
      amount: 'S/ 39,180',
      accent: '#2563eb'
    },
    {
      label: 'WhatsApp',
      share: 17,
      amount: 'S/ 21,485',
      accent: '#10b981'
    },
    {
      label: 'Marketplace',
      share: 10,
      amount: 'S/ 12,635',
      accent: '#ef4444'
    }
  ];

  readonly salesGoals: SalesGoal[] = [
    {
      label: 'Meta diaria',
      value: 'S/ 18,420 de S/ 22,500',
      hint: 'Faltan S/ 4,080 para cerrar el objetivo.',
      progress: 82,
      accent: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
    },
    {
      label: 'Pedidos confirmados',
      value: '27 de 32 pedidos',
      hint: 'Cinco órdenes todavía esperan confirmación.',
      progress: 84,
      accent: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)'
    },
    {
      label: 'Ticket promedio',
      value: 'S/ 682 de S/ 700',
      hint: 'Se sostiene por bundles de periféricos y SSD.',
      progress: 97,
      accent: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
    }
  ];

  readonly topProducts: TopProduct[] = [
    {
      name: 'RTX 4070 Super',
      category: 'Tarjetas gráficas',
      units: 6,
      revenue: 'S/ 18,900'
    },
    {
      name: 'Ryzen 7 7800X3D',
      category: 'Procesadores',
      units: 8,
      revenue: 'S/ 11,760'
    },
    {
      name: 'Samsung 990 Pro 1TB',
      category: 'Almacenamiento',
      units: 11,
      revenue: 'S/ 4,730'
    },
    {
      name: 'Logitech G Pro X',
      category: 'Periféricos',
      units: 9,
      revenue: 'S/ 3,510'
    }
  ];

  readonly orders: OrderQueueItem[] = [
    {
      id: 'PED-1042',
      customer: 'Carlos Ruiz',
      store: 'Mall Aventura',
      total: 'S/ 699',
      status: 'Pago pendiente'
    },
    {
      id: 'PED-1048',
      customer: 'Fernanda Vega',
      store: 'Centro',
      total: 'S/ 1,240',
      status: 'Listo para despacho'
    },
    {
      id: 'PED-1051',
      customer: 'Miguel Castro',
      store: 'Express',
      total: 'S/ 329',
      status: 'Recojo en tienda'
    }
  ];

  readonly inventoryItems: InventoryItem[] = [
    {
      sku: 'CPU-7800X3D',
      name: 'Ryzen 7 7800X3D',
      category: 'Procesadores',
      stock: 5,
      reserved: 2,
      available: 3,
      reorderPoint: 8,
      price: 'S/ 1,470',
      location: 'Rack A-03',
      lastMovement: 'Hoy 09:14',
      status: 'Critico'
    },
    {
      sku: 'SSD-990PRO-1TB',
      name: 'Samsung 990 Pro 1TB',
      category: 'Almacenamiento',
      stock: 7,
      reserved: 1,
      available: 6,
      reorderPoint: 10,
      price: 'S/ 430',
      location: 'Rack B-01',
      lastMovement: 'Hoy 10:02',
      status: 'Bajo'
    },
    {
      sku: 'AUD-HXCLD2',
      name: 'HyperX Cloud II',
      category: 'Auriculares',
      stock: 18,
      reserved: 4,
      available: 14,
      reorderPoint: 8,
      price: 'S/ 390',
      location: 'Rack C-05',
      lastMovement: 'Hoy 08:48',
      status: 'Estable'
    },
    {
      sku: 'GPU-4070S',
      name: 'RTX 4070 Super',
      category: 'Tarjetas gráficas',
      stock: 6,
      reserved: 3,
      available: 3,
      reorderPoint: 6,
      price: 'S/ 3,150',
      location: 'Rack A-09',
      lastMovement: 'Hoy 11:10',
      status: 'Bajo'
    },
    {
      sku: 'KB-LOGGPRO',
      name: 'Logitech G Pro X',
      category: 'Teclados',
      stock: 21,
      reserved: 2,
      available: 19,
      reorderPoint: 10,
      price: 'S/ 460',
      location: 'Rack D-02',
      lastMovement: 'Ayer 05:40 pm',
      status: 'Estable'
    }
  ];

  readonly inventoryCategories: InventoryCategorySummary[] = [
    {
      label: 'Procesadores',
      units: '28 uds',
      share: 32,
      hint: 'Mayor rotación de la semana',
      accent: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
    },
    {
      label: 'Almacenamiento',
      units: '36 uds',
      share: 41,
      hint: 'SSD y NVMe empujan el ticket medio',
      accent: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)'
    },
    {
      label: 'Periféricos',
      units: '19 uds',
      share: 21,
      hint: 'Bundle estable con audífonos y teclados',
      accent: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
    },
    {
      label: 'Tarjetas gráficas',
      units: '8 uds',
      share: 9,
      hint: 'Stock sensible por alta demanda',
      accent: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
    }
  ];

  readonly inventoryRestocks: InventoryRestockItem[] = [
    {
      product: 'Samsung 990 Pro 1TB',
      supplier: 'MemoryTech Perú',
      eta: 'Mañana 11:30 am',
      quantity: '20 uds',
      priority: 'Alta'
    },
    {
      product: 'Ryzen 7 7800X3D',
      supplier: 'AMD Distribución',
      eta: 'Miércoles 03:00 pm',
      quantity: '12 uds',
      priority: 'Alta'
    },
    {
      product: 'RTX 4070 Super',
      supplier: 'Ingram Components',
      eta: 'Viernes 09:00 am',
      quantity: '6 uds',
      priority: 'Media'
    },
    {
      product: 'Logitech G Pro X',
      supplier: 'Gaming Supply',
      eta: 'Próxima semana',
      quantity: '15 uds',
      priority: 'Baja'
    }
  ];

  readonly inventoryMovements: InventoryMovement[] = [
    {
      type: 'Salida',
      product: 'HyperX Cloud II',
      quantity: '-2 uds',
      timestamp: 'Hoy 10:22 am',
      actor: 'Venta mostrador',
      action: 'Pedido PED-1051'
    },
    {
      type: 'Entrada',
      product: 'Logitech G Pro X',
      quantity: '+8 uds',
      timestamp: 'Hoy 08:10 am',
      actor: 'Recepción almacén',
      action: 'OC-208 confirmada'
    },
    {
      type: 'Ajuste',
      product: 'Samsung 990 Pro 1TB',
      quantity: '-1 ud',
      timestamp: 'Ayer 06:40 pm',
      actor: 'Auditoría interna',
      action: 'Corrección por merma'
    }
  ];

  readonly campaigns: CampaignItem[] = [
    {
      title: 'Campaña periféricos gamer',
      window: 'Hasta hoy 11:59 pm',
      owner: 'Marketing retail',
      status: 'Activa'
    },
    {
      title: 'Push de SSD y NVMe',
      window: 'Lun - Vie',
      owner: 'Ecommerce',
      status: 'Requiere revisión'
    },
    {
      title: 'Banner de laptops premium',
      window: 'Próxima semana',
      owner: 'Diseño',
      status: 'Programada'
    }
  ];

  readonly stores: ManagedStore[] = [
    {
      name: 'CompuGamer Centro',
      city: 'Trujillo centro',
      manager: 'Ana López',
      status: 'Activa',
      hours: '9:00 am - 8:00 pm',
      pendingOrders: 11,
      stockHealth: 'Sólido'
    },
    {
      name: 'CompuGamer Mall',
      city: 'Mall Aventura',
      manager: 'Luis Rojas',
      status: 'Atención',
      hours: '10:00 am - 9:00 pm',
      pendingOrders: 9,
      stockHealth: 'Revisar SSD'
    },
    {
      name: 'CompuGamer Express',
      city: 'La Esperanza',
      manager: 'María Vera',
      status: 'Activa',
      hours: '9:30 am - 7:30 pm',
      pendingOrders: 7,
      stockHealth: 'Sólido'
    }
  ];

  readonly alerts = [
    '2 comprobantes pendientes de validación en la tienda Mall.',
    'La línea de procesadores Ryzen bajó de stock mínimo.',
    'La campaña de periféricos vence hoy a las 11:59 pm.'
  ];

  readonly displayMetrics = computed<DashboardMetric[]>(() => {
    switch (this.activeSection()) {
      case 'orders':
        return this.orderMetrics;
      case 'inventory':
        return this.inventoryMetrics;
      case 'landing':
        return this.landingMetrics();
      default:
        return this.salesMetrics;
    }
  });

  readonly currentSectionTitle = computed(() => {
    switch (this.activeSection()) {
      case 'stores':
        return 'Control de tiendas';
      case 'orders':
        return 'Pedidos en seguimiento';
      case 'inventory':
        return this.activeInventorySubview() === 'products' ? 'Inventario · Productos' : 'Inventario · Dashboard';
      case 'landing':
        return 'Landing · Editor visual';
      case 'campaigns':
        return 'Campañas comerciales';
      case 'alerts':
        return 'Centro de alertas';
      default:
        return 'Dashboard de ventas';
    }
  });

  readonly currentSectionDescription = computed(() => {
    switch (this.activeSection()) {
      case 'stores':
        return 'Supervisa el estado, responsables y carga de trabajo de cada sede.';
      case 'orders':
        return 'Sigue las ventas activas y detecta pedidos que requieren acción.';
      case 'inventory':
        return this.activeInventorySubview() === 'products'
          ? 'Consulta el catálogo, el estado del stock y la disponibilidad real de cada producto.'
          : 'Controla stock, reposición, movimientos y alertas clave del almacén.';
      case 'landing':
        return 'Cambia las imágenes del inicio y publica una portada principal o banners secundarios desde este panel.';
      case 'campaigns':
        return 'Administra qué promociones deben empujar la tienda pública.';
      case 'alerts':
        return 'Concentra incidencias y tareas urgentes del día.';
      default:
        return 'Revisa ingresos, canales, productos líderes y objetivos comerciales del día.';
    }
  });

  selectSection(section: DashboardSection): void {
    this.activeSection.set(section);

    if (section === 'inventory') {
      this.activeInventorySubview.set('dashboard');
      void this.persistDashboardState(section, 'dashboard');
      return;
    }

    void this.persistDashboardState(section);
  }

  selectInventorySubview(view: InventorySubview): void {
    this.activeInventorySubview.set(view);
    this.activeSection.set('inventory');
    void this.persistDashboardState('inventory', view);
  }

  toggleLandingEditMode(): void {
    this.landingEditMode.update((isActive) => !isActive);
  }

  landingCoverPreview(slotId: string): string | null {
    return this.landingCoverStore.coverPreview(slotId);
  }

  onLandingCoverSelected(event: Event, slotId: string): void {
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

  clearLandingCover(slotId: string): void {
    this.landingCoverStore.clearCover(slotId);
  }

  private readInitialSection(): DashboardSection {
    const section = this.route.snapshot.queryParamMap.get('section');
    return this.isDashboardSection(section) ? section : 'overview';
  }

  private readInitialInventorySubview(): InventorySubview {
    const view = this.route.snapshot.queryParamMap.get('inventoryView');
    return this.isInventorySubview(view) ? view : 'dashboard';
  }

  private isDashboardSection(value: string | null): value is DashboardSection {
    return value != null && DASHBOARD_SECTIONS.includes(value as DashboardSection);
  }

  private isInventorySubview(value: string | null): value is InventorySubview {
    return value != null && INVENTORY_SUBVIEWS.includes(value as InventorySubview);
  }

  private persistDashboardState(section: DashboardSection, inventoryView?: InventorySubview): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        section,
        inventoryView: section === 'inventory' ? inventoryView ?? this.activeInventorySubview() : null
      },
      queryParamsHandling: 'merge'
    });
  }

  logout(): void {
    this.authSessionStore.logout();
    void this.router.navigateByUrl('/');
  }
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';

const PRODUCT_REFERENCE_IMAGE_URL = 'https://cdn.catalog-store.link/4c0f22ea47ec41b810f646b082440231_photo.webp';

@Injectable({
  providedIn: 'root'
})
export class MockProductRepository extends ProductRepository {
  private products: Product[] = [
    {
      id: '1',
      category: 'Mouses',
      name: 'Mouse Logitech G502',
      brand: 'Logitech',
      description: 'Mouse gaming de alto rendimiento con sensor HERO 25K y 11 botones programables.',
      price: 59.99,
      oldPrice: 69.99,
      imageUrl: PRODUCT_REFERENCE_IMAGE_URL,
      badge: '-15%',
      badgeClass: 'badge-danger',
      reviews: 1250,
      specs: {
        'Sensor': 'HERO 25K',
        'DPI': '100 - 25,600',
        'Botones': '11 programables',
        'Conexión': 'USB'
      }
    },
    {
      id: '2',
      category: 'Teclados',
      name: 'Teclado Corsair K60 RGB',
      brand: 'Corsair',
      description: 'Teclado mecánico gaming con switches Cherry MX Red e iluminación RGB per-key.',
      price: 89.99,
      imageUrl: PRODUCT_REFERENCE_IMAGE_URL,
      badge: 'NUEVO',
      badgeClass: 'badge-success',
      reviews: 980,
      specs: {
        'Switches': 'Cherry MX Red',
        'RGB': 'Per-key',
        'Anti-ghosting': '100%',
        'Layout': 'TKL'
      }
    },
    {
      id: '3',
      category: 'Pantallas',
      name: 'Monitor Samsung 27" Curvo 144Hz',
      brand: 'Samsung',
      description: 'Panel VA curvo 1500R con 144Hz, tiempo de respuesta 1ms y resolución Full HD.',
      price: 199.99,
      oldPrice: 219.99,
      imageUrl: PRODUCT_REFERENCE_IMAGE_URL,
      badge: '-10%',
      badgeClass: 'badge-danger',
      reviews: 750,
      specs: {
        'Tamaño': '27"',
        'Resolución': '1920×1080',
        'Refresh': '144Hz',
        'Panel': 'VA Curvo'
      }
    },
    {
      id: '4',
      category: 'Tarjetas Gráficas',
      name: 'Tarjeta Gráfica ASUS RTX 4060 8GB',
      brand: 'ASUS',
      description: 'GPU NVIDIA RTX 4060 con 8GB GDDR6, DLSS 3 y ray tracing de nueva generación.',
      price: 299.99,
      oldPrice: 339.99,
      imageUrl: PRODUCT_REFERENCE_IMAGE_URL,
      badge: '-12%',
      badgeClass: 'badge-danger',
      reviews: 620,
      specs: {
        'GPU': 'RTX 4060',
        'VRAM': '8GB GDDR6',
        'DLSS': '3.0',
        'TDP': '115W'
      }
    },
    {
      id: '5',
      category: 'Auriculares',
      name: 'Auriculares HyperX Cloud II',
      brand: 'HyperX',
      description: 'Auriculares gaming con drivers de 53mm, sonido envolvente 7.1 y micrófono desmontable.',
      price: 79.99,
      imageUrl: PRODUCT_REFERENCE_IMAGE_URL,
      badge: 'NUEVO',
      badgeClass: 'badge-success',
      reviews: 1100,
      specs: {
        'Drivers': '53mm',
        'Sonido': '7.1 Virtual',
        'Freq.': '15Hz - 25kHz',
        'Conexión': 'USB / 3.5mm'
      }
    },
    {
      id: '6',
      category: 'Almacenamiento',
      name: 'SSD Samsung 970 EVO 1TB',
      brand: 'Samsung',
      description: 'SSD NVMe M.2 con velocidades de lectura de hasta 3,500 MB/s. Máximo rendimiento.',
      price: 109.99,
      oldPrice: 129.99,
      imageUrl: PRODUCT_REFERENCE_IMAGE_URL,
      badge: 'MÁS VENDIDO',
      badgeClass: 'badge-accent',
      reviews: 2200,
      specs: {
        'Capacidad': '1TB',
        'Interfaz': 'NVMe M.2',
        'Lectura': '3,500 MB/s',
        'Escritura': '2,700 MB/s'
      }
    },
    {
      id: '7',
      category: 'Accesorios',
      name: 'Silla Gaming DXRacer Formula',
      brand: 'DXRacer',
      description: 'Silla gaming ergonómica con soporte lumbar ajustable, reposacabezas y cuero PU premium.',
      price: 249.99,
      oldPrice: 299.99,
      imageUrl: PRODUCT_REFERENCE_IMAGE_URL,
      badge: '-17%',
      badgeClass: 'badge-danger',
      reviews: 430,
      specs: {
        'Material': 'Cuero PU',
        'Reclinación': '90°-135°',
        'Peso máx.': '100kg',
        'Reposabrazos': '3D'
      }
    },
    {
      id: '8',
      category: 'Accesorios',
      name: 'Webcam Logitech C920 HD Pro',
      brand: 'Logitech',
      description: 'Webcam Full HD 1080p con enfoque automático, corrección de luz y micrófono estéreo.',
      price: 69.99,
      imageUrl: PRODUCT_REFERENCE_IMAGE_URL,
      badge: 'LIMITADO',
      badgeClass: 'badge-warning',
      reviews: 875,
      specs: {
        'Resolución': '1080p / 30fps',
        'FOV': '78°',
        'Enfoque': 'Automático',
        'Micrófono': 'Estéreo'
      }
    }
  ];

  getAll(): Observable<Product[]> {
    return of(this.products);
  }

  getById(id: string): Observable<Product> {
    const product = this.products.find((product) => product.id === id);
    return of(product!);
  }
}

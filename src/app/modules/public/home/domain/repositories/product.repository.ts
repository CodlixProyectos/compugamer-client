import { Observable } from 'rxjs';
import { Product } from '../entities/product.entity';

export abstract class ProductRepository {
  abstract getAll(): Observable<Product[]>;
  abstract getById(id: string): Observable<Product>;
}

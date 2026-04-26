import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';

@Injectable({
  providedIn: 'root'
})
export class GetProductByIdUseCase {
  private readonly productRepository = inject(ProductRepository);

  execute(id: string): Observable<Product> {
    return this.productRepository.getById(id);
  }
}

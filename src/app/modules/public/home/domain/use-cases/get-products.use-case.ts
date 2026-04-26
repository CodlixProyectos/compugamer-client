import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';

@Injectable({
  providedIn: 'root'
})
export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  execute(): Observable<Product[]> {
    return this.productRepository.getAll();
  }
}

import { ProductCategory } from 'src/app/common/product-category';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../common/product';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/api/products';
  private categoryUrl = 'http://localhost:8080/api/product-category';

  constructor(private httpClient: HttpClient) {}
  // method to get the products list by category
  getProductList(theCategoryId: number): Observable<Product[]> {
    //  URL based on category
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.httpClient
      .get<GetResponseProducts>(searchUrl)
      .pipe(map((response) => response._embedded.products));
  }
  // method to get the categories
  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient
      .get<GetResponseProductCAtegory>(this.categoryUrl)
      .pipe(map((response) => response._embedded.productCategory));
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  };
}

interface GetResponseProductCAtegory {
  _embedded: {
    productCategory: ProductCategory[];
  };
}

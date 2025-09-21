export interface Rating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: Rating;
}

export interface ProductInput {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rate: number;
  count: number;
}

export interface ProductArgs {
  id: string;
}

export interface AddProductArgs {
  product: ProductInput;
}
import { IProduct } from '@detective.solutions/shared/data-access';

export class ProductDTO implements IProduct {
  constructor(
    public name: string,
    public price: number,
    public currency: string,
    public iteration: string,
    public userLimit: number
  ) {}

  static Build(productInput: IProduct) {
    return new ProductDTO(
      productInput.name,
      productInput.price,
      productInput.currency,
      productInput.iteration,
      productInput.userLimit
    );
  }
}

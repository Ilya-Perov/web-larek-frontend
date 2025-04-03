import { Model } from './base/Model';
import { IProduct, IOrder, IOrderForm, IAppState, FormErrors, IContactForm } from '../types';

export type CatalogChangeEvent = {
  catalog: Product[]
};

export class Product extends Model<IProduct> {
  id: string;
  description: string;
  title: string;
  image: string;
  price: number | null;
  category: string;
}

export class AppState extends Model<IAppState> {
  catalog: Product[];
  basket: Product[] = [];
  order: IOrder = {
    payment: 'online',
    address: '',
    email: '',
    phone: '',
    total: 0,
    items: []
  };
  preview: string | null;
  formErrors: FormErrors = {};

  clearOrder() {
    this.order = {
      payment: 'online',
      address: '',
      email: '',
      phone: '',
      total: 0,
      items: []
    }
  }

  setCatalog(items: IProduct[]) {
    this.catalog = items.map(item => new Product(item, this.events));
    this.emitChanges('items:changed', { catalog: this.catalog });
  }

  setPreview(item: Product) {
    this.preview = item.id;
    this.emitChanges('preview:changed', item);
  }
  handleBasketAction(action: string, item: Product): void {
    switch (action) {
      case 'add':
        if (!this.basket.includes(item)) {
          this.basket.push(item);
        }
        break;
      case 'remove':
        this.basket = this.basket.filter(el => el !== item);
        break;
      default:
        break;
    }

    this.refreshBasket();
  }

  removeBasket(): void {
    this.basket = [];
    this.refreshBasket();
  }

  refreshBasket(): void {
    this.emitChanges('counter:changed', this.basket);
    this.emitChanges('basket:changed', this.basket);
  }

  setOrderField(field: keyof IOrderForm, value: string) {
    this.order[field] = value;
    if (this.validateOrder()) {
      this.events.emit('order:ready', this.order);
    }
  }

  setContactField(field: keyof IContactForm, value: string) {
    this.order[field] = value;
    if (this.validateContact()) {
      this.events.emit('contact:ready', this.order);
    }
  }

  validateContact() {
    const errors: typeof this.formErrors = {};
    if (!this.order.email) {
      errors.email = 'Необходимо указать email';
    }
    if (!this.order.phone) {
      errors.phone = 'Необходимо указать телефон';
    }
    this.formErrors = errors;
    this.events.emit('formErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }

  validateOrder() {
    const errors: typeof this.formErrors = {};
    if (!this.order.address) {
      errors.address = 'Необходимо указать адрес доставки'
    }
    this.formErrors = errors;
    this.events.emit('formErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }
}

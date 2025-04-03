export interface IProduct {
  id: string;
  title: string;
  price: number | null;
  description: string;
  category: string;
  image: string;
}

export interface IAppState {
  catalog: IProduct[];
  basket: IProduct[];
  preview: string | null;
  delivery: IOrderForm | null;
  contact: IContactForm | null;
  order: IOrder | null;
}

export interface IOrderForm {
  payment: string;
  address: string;
}

export interface IContactForm {
  email: string;
  phone: string;
}

export interface IOrder extends IOrderForm, IContactForm {
  total: number;
  items: string[];
}

export interface IOrderResult {
  id: string;
  total: number;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface ICards extends IProduct{
  index?: string;
  buttonTitle? : string;
}

export interface IBasketView {
  items: HTMLElement[];
  total: number;
}

export interface IPage{
  counter: number;
  gallery: HTMLElement[];
}

export interface IActions {
  onClick: (event: MouseEvent) => void;
}

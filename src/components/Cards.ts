import { Component } from './base/Component';
import { ICards, IActions } from '../types';
import { ensureElement } from '../utils/utils';
import { cardCategory } from '../utils/constants'

export class Cards extends Component<ICards> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _image?: HTMLImageElement;
  protected _text?: HTMLElement;
  protected _button?: HTMLButtonElement;
  protected _category?: HTMLElement;
  protected _index?: HTMLElement;

  constructor(container: HTMLElement, actions?: IActions) {
    super(container);

    this._title = ensureElement<HTMLElement>('.card__title', container);
    this._price = ensureElement<HTMLElement>('.card__price', container);
    this._image = container.querySelector('.card__image');
    this._button = container.querySelector('.card__button');
    this._text = container.querySelector('.card__text');
    this._category = container.querySelector('.card__category');
    this._index = container.querySelector('.basket__item-index');

    if (actions?.onClick && this._button) {
      this._button.addEventListener('click', actions.onClick);
    } else if (actions?.onClick) {
      container.addEventListener('click', actions.onClick);
    }
  }

  disableButton(value: number | null) {
    if (value === null && this._button) {
      this._button.disabled = true;
    }
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  get id(): string {
    return this.container.dataset.id || '';
  }
  
  set buttonText(value: string) {
    if (this._button) {
      this._button.textContent = value;
    }
  }
  set title(value: string) {
    this.setText(this._title, value);
  }

  get title(): string {
    return this._title.textContent || '';
  }

  set price(value: number | null) {
    this.setText(this._price, (value) ? `${value.toString()} синапсов` : '');
    this.disableButton(value);
  }

  get price(): number {
    return Number(this._price.textContent || '');
  }

  set category(value: string) {
    this.setText(this._category, value);
    this._category.classList.add(cardCategory[value])
  }

  get category(): string {
    return this._category.textContent || '';
  }

  set index(value: string) {
    this._index.textContent = value;
  }

  get index(): string {
    return this._index.textContent || '';
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title)
  }

  set text(value: string) {
    this.setText(this._text, value);
  }
}

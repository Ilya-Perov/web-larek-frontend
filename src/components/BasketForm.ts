import { Component } from './base/Component';
import { createElement, ensureElement } from '../utils/utils';
import { IBasketView } from '../types';
import { EventEmitter } from './base/events';

export class BasketForm extends Component<IBasketView> {
  protected _list: HTMLElement;
    protected _price: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._price = this.container.querySelector('.basket__price');
        this._button = this.container.querySelector('.basket__button');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }

        this.items = [];
        this._button.disabled = true;
    }

    toggleButton(isDisabled: boolean){
      if (this._button) {
        this._button.disabled = isDisabled;
      }
    }

    set items(items: HTMLElement[]) {
      const content = items.length
        ? [...items]
        : [createElement<HTMLParagraphElement>('p', { textContent: 'Корзина пуста' })];
    
      this._list.replaceChildren(...content);
    }

    set total(total: number) {
      this.setText(this._price, `${total.toString()} синапсов`);
    }
}

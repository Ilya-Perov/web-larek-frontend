import { Form } from './common/Form';
import { IOrderForm, IActions} from '../types';
import { ensureElement } from '../utils/utils';
import { IEvents } from '../components/base/events';


export class OrderForm extends Form<IOrderForm> {
  protected _paymentCardButton: HTMLButtonElement;
  protected _paymentCashButton: HTMLButtonElement;

  constructor(container: HTMLFormElement, events: IEvents, actions?: IActions) {
    super(container, events);

    this._paymentCardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
    this._paymentCashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
    this._paymentCardButton.classList.add('button_alt-active');

    if (actions?.onClick) {
      this.addButtonClickHandler(actions.onClick);
    }
  }

  private addButtonClickHandler(onClick?: (event: MouseEvent) => void) {
    if (onClick) {
      this._paymentCardButton.addEventListener('click', onClick);
      this._paymentCashButton.addEventListener('click', onClick);
    }
  }
  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }

  toggleButtons(toggleOn: HTMLElement) {
    this._paymentCardButton.classList.toggle('button_alt-active', toggleOn === this._paymentCardButton);
    this._paymentCashButton.classList.toggle('button_alt-active', toggleOn === this._paymentCashButton);
  }
}

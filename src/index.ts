import './scss/styles.scss';
import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL, PaymentTypes } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppState, CatalogChangeEvent, Product } from './components/AppState';
import { Page } from './components/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { IContactForm, IOrderForm, IOrder } from './types';
import { Cards } from './components/Cards';
import { BasketForm } from './components/BasketForm';
import { OrderForm } from './components/OrderForm';
import { ContactForm } from './components/ContactForm';
import { Success } from './components/common/Success';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
  console.log(eventName, data);
})

// Все шаблоны
const cardCatalogElm = ensureElement<HTMLTemplateElement>('#card-catalog');
const contactsElm = ensureElement<HTMLTemplateElement>('#contacts');
const successElm = ensureElement<HTMLTemplateElement>('#success');
const cardPreviewElm = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketElm = ensureElement<HTMLTemplateElement>('#card-basket');
const basketElm = ensureElement<HTMLTemplateElement>('#basket');
const orderElm = ensureElement<HTMLTemplateElement>('#order');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const pageContainer = new Page(document.body, events);
const modalContainer = new Modal(ensureElement<HTMLElement>('#modal-container'), events);


// Переиспользуемые части интерфейса
const basketEv = new BasketForm(cloneTemplate(basketElm), events);
const orderEv = new OrderForm(cloneTemplate(orderElm), events, {
  onClick: (ev: Event) => events.emit('payment:toggle', ev.target)
});
const contact = new ContactForm(cloneTemplate(contactsElm), events);


// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
  pageContainer.gallery = appData.catalog.map(item => {
    const card = new Cards(cloneTemplate(cardCatalogElm), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      title: item.title,
      image: item.image,
      price: item.price,
      category: item.category
    })
  })
});

// Определение функции для обработки выбора товара
const handleCardSelect = (item: Product) => {
  appData.setPreview(item);
};

// Отправлена форма заказа
events.on('order:submit', () => {
  modalContainer.render({
    content: contact.render({
      email: '',
      phone: '',
      valid: false,
      errors: []
    })
  })
})

function handleOrderSubmit() {
  api.orderProducts(appData.order)
    .then((result) => {
      appData.removeBasket();
      appData.clearOrder();
      const success = new Success(cloneTemplate(successElm), {
        onClick: () => {
          modalContainer.close();
        }
      });
      success.description = result.total.toString();

      modalContainer.render({
        content: success.render({})
      });
    })
    .catch(err => {
      console.error(err);
    });
}

// Обработчик изменения предварительного просмотра
const handlePreviewChanged = (item: Product) => {
  const card = new Cards(cloneTemplate(cardPreviewElm), {
    onClick: () => {
      events.emit('product:toggle', item);
      card.buttonText = (appData.basket.indexOf(item) < 0) ? 'Купить' : 'Удалить из корзины'
    }
  });
  modalContainer.render({
    content: card.render({
      title: item.title,
      description: item.description,
      image: item.image,
      price: item.price,
      category: item.category,
      buttonTitle: (appData.basket.indexOf(item) < 0) ? 'Купить' : 'Удалить из корзины'
    })
  })
};

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrder>) => {
  const { payment, address, email, phone } = errors;
  orderEv.valid = !payment && !address;
  contact.valid = !email && !phone;
  orderEv.errors = Object.values({ payment, address }).filter(i => !!i).join('; ');
  contact.errors = Object.values({ phone, email }).filter(i => !!i).join('; ');
});

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setOrderField(data.field, data.value)
})

events.on(/^contacts\..*:change/, (data: { field: keyof IContactForm, value: string }) => {
  appData.setContactField(data.field, data.value)
})

// Подписка на событие выбора товара
events.on('card:select', handleCardSelect);

// Подписка на событие изменения предварительного просмотра
events.on('preview:changed', handlePreviewChanged);

//Обновление 
events.on('product:toggle', (item: Product) => {
  if (appData.basket.indexOf(item) < 0) {
    events.emit('product:add', item);
  }
  else {
    events.emit('product:delete', item);
  }
});

events.on('product:add', (item: Product) => {
  appData.handleBasketAction('add', item);
});

events.on('product:delete', (item: Product) => {
  appData.handleBasketAction('remove', item)
});
events.on('basket:changed', (items: Product[]) => {
  basketEv.items = items.map((item, index) => {
    const card = new Cards(cloneTemplate(cardBasketElm), {
      onClick: () => {
        events.emit('product:delete', item);
      }
    });
    return card.render({
      index: (index + 1).toString(),
      title: item.title,
      price: item.price,
    });
  });

  const total = items.reduce((total, item) => total + item.price, 0);
  basketEv.total = total;
  appData.order.total = total;
  basketEv.toggleButton(total === 0);
});

events.on('counter:changed', (item: string[]) => {
  pageContainer.counter = appData.basket.length;
});

// Открытие корзины
events.on('basket:open', () => {
  modalContainer.render({
    content: basketEv.render({})
  })
});

//Открытие формы доставки
events.on('order:open', () => {
  modalContainer.render({
    content: orderEv.render({
      payment: '',
      address: '',
      valid: false,
      errors: []
    })
  });
  appData.order.items = appData.basket.map(item => item.id);
});

// Переключение оплаты
events.on('payment:toggle', (target: HTMLElement) => {
  if (!target.classList.contains('button_alt-active')) {
    orderEv.toggleButtons(target);
    appData.order.payment = PaymentTypes[target.getAttribute('name')];
    console.log(appData.order)
  }
});

// Подписываемся на событие 'modal:open' и передаем в него функцию handleModalOpen
events.on('modal:open', handleModalOpen);

// Подписываемся на событие 'modal:close' и передаем в него функцию handleModalClose
events.on('modal:close', handleModalClose);

// Вызываем функцию для получения списка продуктов
fetchProductList();


// Событие заполненности формы
events.on('order:ready', () => {
  orderEv.valid = true;
})

events.on('contact:ready', () => {
  contact.valid = true;
})

events.on('contacts:submit', handleOrderSubmit);
// Функция обработчика события открытия модального окна
function handleModalOpen() {
  pageContainer.locked = true;
}

// Функция обработчика события закрытия модального окна
function handleModalClose() {
  pageContainer.locked = false;
}

// Функция для получения списка продуктов при открытии страницы
function fetchProductList() {
  api.getProductList()
    .then((catalog) => {
      appData.setCatalog(catalog);
    })
    .catch((err) => {
      console.log(err);
    });
}
(() => {
  'use strict';

  const product = document.querySelector('[data-product]');
  if (!product) return;

  const form = product.querySelector('[data-product-form]');
  if (!form) return;

  // Элементы карточки товара
  const els = {
    sku: product.querySelector('[data-product-sku]'),
    price: product.querySelector('[data-product-price]'),
    oldPrice: product.querySelector('[data-product-old-price]'),
    oldWrap: product.querySelector('[data-product-old-wrap]'),
    unit: product.querySelector('[data-product-unit]'),
    discount: product.querySelector('[data-product-discount]'),
    cart: product.querySelector('[data-product-cart]'),
    cartText: product.querySelector('[data-product-cart-text]'),
  };

  // Форматирование цен
  const numberFormat = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  const formatPrice = (value) => {
    const price = Number(value);

    return Number.isFinite(price)
      ? `${numberFormat.format(price)}\u00A0₽`
      : '—';
  };

  // Данные выбранной фасовки
  const getVariant = (input) => {
    const price = Number(input.dataset.price);
    const oldPrice = Number(input.dataset.oldPrice);
    const weight = Number(input.value);

    if (
      input.dataset.price === undefined ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return null;
    }

    const hasDiscount =
      Number.isFinite(oldPrice) &&
      input.dataset.oldPrice !== undefined &&
      oldPrice > price;

    return {
      sku: input.dataset.sku || '',
      price,
      oldPrice,
      weight,
      hasDiscount,
    };
  };

  // Обновление цены, артикула и скидки
  const updateProduct = (input) => {
    const variant = getVariant(input);
    if (!variant) return;

    const { sku, price, oldPrice, weight, hasDiscount } = variant;

    if (els.sku) {
      els.sku.textContent = sku;
    }

    if (els.price) {
      els.price.textContent = formatPrice(price);

      if ('value' in els.price) {
        els.price.value = price;
      }
    }

    if (els.oldWrap) {
      els.oldWrap.hidden = !hasDiscount;
    }

    if (els.discount) {
      els.discount.hidden = !hasDiscount;
      els.discount.textContent = hasDiscount
        ? `−${Math.round((1 - price / oldPrice) * 100)}%`
        : '';
    }

    if (els.oldPrice) {
      els.oldPrice.hidden = !hasDiscount;

      if (hasDiscount) {
        els.oldPrice.textContent = formatPrice(oldPrice);

        if ('value' in els.oldPrice) {
          els.oldPrice.value = oldPrice;
        }
      }
    }

    if (els.unit) {
      els.unit.textContent =
        `${formatPrice((price / weight) * 100)} за 100\u00A0г`;
    }
  };

  // Обратная связь кнопки корзины
  let resetTimer;

  const setCartState = (added) => {
    els.cart?.classList.toggle('is-added', added);

    if (els.cartText) {
      els.cartText.textContent = added ? 'Добавлено' : 'В корзину';
    }

    els.cart?.setAttribute(
      'aria-label',
      added ? 'Товар добавлен' : 'Добавить в корзину'
    );
  };

  // Выбор фасовки
  form.addEventListener('change', (event) => {
    const input = event.target;

    if (
      input instanceof HTMLInputElement &&
      input.name === 'weight' &&
      input.checked
    ) {
      updateProduct(input);
    }
  });

  // Визуальный отклик корзины
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    clearTimeout(resetTimer);
    setCartState(true);

    resetTimer = setTimeout(() => {
      setCartState(false);
    }, 1500);
  });

  // Начальное состояние карточки
  const selectedInput = form.querySelector(
    'input[name="weight"]:checked'
  );

  if (selectedInput) {
    updateProduct(selectedInput);
  }
})();


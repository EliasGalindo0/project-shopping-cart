const cartItems = document.querySelector('.cart__items');
const clearButton = document.querySelector('.empty-cart');

// Recebe um src como parâmetro e cria um elemento img com o parâmetro passado 
const createProductImageElement = (imageSource) => {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
};

// cria os elementos, atribui classes e textos a eles. Os três parâmetros que possui, são: a tag HTML, a classe do elemento e o texto que será mostrado.
const createCustomElement = (element, className, innerText) => {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
};

// recebe um objeto como parâmetro, cria section com a classe .item, e adicina o elemento pronto ao HTML. Esses elementos são criados através da função acima, sendo que a imagem é feita através da primeira função.
const createProductItemElement = ({ sku, name, image }) => {
  const section = document.createElement('section');
  section.className = 'item';
  
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  
  return section;
};

// recebe um item como parâmetro e captura os spans com a classe .item__sku. Com o elemento capturado, insere seu texto onde ou quando for chamada a função.
const getSkuFromProductItem = (item) => item.querySelector('span.item__sku').innerText;

// função responsável por calcular o valor total dos itens que estão no carrinho. **
const totalPrice = async () => {
  let sum = 0;
  const amount = document.querySelector('.total-price'); 
  const itemsInCart = document.querySelectorAll('.cart__item'); 
  itemsInCart.forEach((price) => {
      const split = price.innerText.split(' ');
      const number = split.slice(-1)[0].slice(1);
      sum += Number(number);
    });
    amount.innerHTML = sum;
};

// captura os elementos que representam os itens de dentro do carrinho. Se houver itens no carrinho, remove aqueles que são clicados. Chama a função total price para calcular novamente o valor do carrinho atualizado.
const cartItemClickListener = (event) => {
  const liElement = document.querySelector('.cart__item');
  if (liElement) {
    cartItems.removeChild(event.target);
    totalPrice();
  }
};

// cria os elementos 'li' que irão para o carrinho de compras. recebe um objeto com os valores obtivos através da função getParametersItemCart e adciona um listener às 'li' que, ao clicar, chama a função cartItemClickListener (útil para tirar os itens do carrinho ao clicar neles)
const createCartItemElement = ({ sku, name, salePrice }) => {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  // li.addEventListener('click', cartItemClickListener);
  return li;
};

// recebe um item como parâmetro, captura o elemento pai dos itens do carrinho ('ol'), chama a função createCartItemElement (que retorna um li com os valores: sku, name, price) e adiciona os itens, que forem clicados, no elemento pai.
const insertItemCart = (item) => {
  const createItemCart = createCartItemElement(item);
  cartItems.appendChild(createItemCart);
  totalPrice();
  saveCartItems(cartItems.innerHTML);
};

// função assíncrona, que recebe o resultado da consulta à API e monta um obejto itemCart, que será enviado como parâmetro para a função acima. Obs. getSku
const getParametersItemCart = async (event) => {
  // esse bloco chama a função getSku... (que retorna uma li com o seu texto) passando como parâmetro um evento. Como a função retorna um li com as informações desejadas, o parâmetro passado retorna o nó pai do elemento, sendo que essa função é chamada quando clica no elemento, graças ao listener da função productsOnScreen
  const getSku = getSkuFromProductItem(event.target.parentNode);
  const data = await fetchItem(getSku);
  const itemCart = { 
    sku: data.id, 
    name: data.title, 
    salePrice: data.price,
  };
  insertItemCart(itemCart);
};

// usa a função que cria os elementos para criar um section, classe loadind e texto loading. após criar o elemento, faz um append na section pai (items).
const loader = (nodeParent) => {
  const createLoader = createCustomElement('section', 'loading', 'carregando...');
  nodeParent.appendChild(createLoader);
};

// remove o elemento criado na função acima logo após fazer o fetch na fução productsOnScreen, uma vez que é chamada após o fetch, tendo, as duas funções loading, como parâmetro o elemento pai quando são chamadas na função abaixo.
const loadcomplet = (nodeParent) => {
  const loaded = document.querySelector('.loading');
  nodeParent.removeChild(loaded);
};

// função assíncrona que recebe o resultado da API e, cria um objeto com 3 valores, chama a função que cria os elementos passando para ela os parâmetros obtidos por meio do destructuring. É carregada onLoad e tem o listener que  chama a função que alimenta os parâmetros dos itens quando clicada e faz o appendChild no carrinho.
const productsOnScreen = async () => {
  const itemsSection = document.querySelector('.items');
  loader(itemsSection);
  
  const data = await fetchProducts('computador');
  loadcomplet(itemsSection);
  
  const products = data.results;
  
  products.forEach((product) => {
    const { id, title, thumbnail } = product;
    const itemMarket = (createProductItemElement({ sku: id, name: title, image: thumbnail }));
    const parentElementItems = document.querySelector('.items');
    parentElementItems.appendChild(itemMarket);
    parentElementItems.addEventListener('click', getParametersItemCart);
  });
};

// limpa os elementos do carrinho
const clearCart = () => {
  cartItems.innerHTML = '';
  totalPrice();
};
clearButton.addEventListener('click', clearCart);

// recupera os items salvos no local storage e adiciona o listener para chamar a função para apagar os itens novamente.
const getItemsFromLocalStorage = () => {
  const savedItems = getSavedCartItems('cartItems');
  cartItems.innerHTML = savedItems;
  cartItems.addEventListener('click', cartItemClickListener);
};
  getItemsFromLocalStorage();
    
  window.onload = async () => {
  await productsOnScreen();
  await totalPrice();
};

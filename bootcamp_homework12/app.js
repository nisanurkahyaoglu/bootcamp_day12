(($) => {
    'use strict';
    const classes = {
        style: 'custom-style',
        wrapper: 'custom-wrapper',
        card: 'product-card',
        image: 'product-image',
        title: 'product-title',
        price: 'product-price',
        addToCartButton: 'add-to-cart-btn',
        showDetails: 'show-details-btn',
        toast: 'custom-toast',
        toastContainer: 'custom-toast-container'
    };

    const selectors = {
        style: `.${classes.style}`,
        wrapper: `.${classes.wrapper}`,
        card: `.${classes.card}`,
        image: `.${classes.image}`,
        title: `.${classes.title}`,
        price: `.${classes.price}`,
        addToCartButton: `.${classes.addToCartButton}`,
        showDetails: `.${classes.showDetails}`,
        toast: `.${classes.toast}`,
        toastContainer: `.${classes.toastContainer}`,
        appendLocation: '#container'
    };

    const self = {};
    self.products = [];

    self.init = () => {
        self.reset();
        self.buildCSS();
        self.buildHTML();
        self.fetchProducts();
        self.updateCartCount();
    };

    self.reset = () => {
        $(selectors.style).remove();
        $(selectors.wrapper).remove();
        $(selectors.toastContainer).remove();
        $(document).off('.eventListener');
    };

    self.buildCSS = () => {
        const customStyle = `
      <style class="${classes.style}">

      ${selectors.wrapper} {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        padding: 10px;
        gap: 20px;
        background-color: #f3e2f3;
        margin-top: 30px;
      }
      ${selectors.card} {
        width: 300px;
        padding: 15px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }
      ${selectors.image} {
        width: 100px;
        height: 100px;
        object-fit: contain;
      }
      ${selectors.title} {
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        color: black;
      }
      ${selectors.price} {
        color: green;
        font-weight: bold;
      }

    ${ selectors.addToCartButton } { 
         padding: 4px 8px; 
         background-color: #d600f7ff; 
         color: #fff; 
         border: none; 
         border-radius: 4px; 
         cursor: pointer; 
         } 

     ${ selectors.addToCartButton }:hover {
      background-color: #790d80ff; 
      } 

      ${ selectors.showDetails } { 
         padding: 7px; 
         background-color: #d600f7ff; 
         color: #fff; 
         border: none; 
         border-radius: 4px; 
         cursor: pointer; 
         margin-right:10px
        } 

      ${ selectors.showDetails }:hover {
      background-color: #790d80ff; } 

      ${selectors.toastContainer} {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      ${selectors.toast} {
        background-color: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        font-weight: bold;
        animation: fadeOut 0.5s ease-in-out forwards;
      }

      ${classes.card} .button-group {
        display: flex;
        gap: 8px;
        }

      .slider {
        margin: 20px auto;
        max-width: 100%;
      }
      .slider .slider-item {
        padding: 10px;
        cursor: pointer;
      }
      .slider .slider-item img {
        height: 120px;
        object-fit: contain;
        background: white;
        padding: 10px;
      }
      @keyframes fadeOut {
        0% { opacity: 1; }
        80% { opacity: 0.5; }
        100% { opacity: 0; }
      }
      </style>
    `;
        $('head').append(customStyle);
    };


    self.debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    self.filterSliderById = (searchTerm) => {
        const lowerSearch = searchTerm.trim().toLowerCase();
        if (!lowerSearch) {
            $('#slider .slider-item').show();
            return;
        }
        $('#slider .slider-item').each(function() {
            const index = $(this).index();
            const product = self.products[index];
            if (product && product.id.toString().toLowerCase().includes(lowerSearch)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    };

    self.buildHTML = () => {

        const searchInput = `
      <div style="text-align:center; margin: auto; width:500px">
        <input id="product-search" type="text" placeholder="Ürün ID ile ara..." style="text-align:center; padding: 8px; width: 400px; color:black; border-radius: 5px; border: 1px solid #ccc;">
      </div>
    `;

        const slider = `<div id="slider" class="slider"></div>`;
        const wrapper = `<div class="${classes.wrapper}"></div>`;
        const toastContainer = `<div class="${classes.toastContainer}"></div>`;

        const cartCounter = `
      <div id="cart-counter" style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d600f7ff;
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
      ">
        🛒 <span id="cart-count">0</span>
      </div>
    `;

        const cartModal = `
      <div id="cart-modal" style="
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        padding: 20px;
        width: 500px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 10001;
      ">
        <h3 style="margin-top:0; color:black; font-weight:bold;">Sepetinizdeki Ürünler</h3>
        <ul id="cart-items-list" style="padding-left: 20px; min-height: 100px; color:black; user-select:none;";></ul>

        <button id="clear-cart-btn" style="
          background: #d600f7ff;
          color: black;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
          width: 100%;
          font-weight: bold;
          margin-top: 20px;
        ">Sepeti Temizle</button>

        <button id="close-cart-modal" style="
          margin-top: 8px;
          width: 100%;
          padding: 6px 12px;
          border: none;
          background: #ccc;
          color: #333;
          border-radius: 5px;
          cursor: pointer;
        ">Kapat</button>
      </div>

      <div id="modal-overlay" style="
        display: none;
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
      "></div>
    `;

        $(selectors.appendLocation).append(searchInput + slider + wrapper);
        $('body').append(toastContainer);
        $('body').append(cartCounter);
        $('body').append(cartModal);

        $('#cart-counter').on('click', () => {
            self.showCartModal();
        });

        $('#close-cart-modal').on('click', () => {
            self.hideCartModal();
        });

        $('#modal-overlay').on('click', () => {
            self.hideCartModal();
        });

        $('#clear-cart-btn').on('click', () => {
            self.clearCart();
            self.hideCartModal();
        });

        self.showCartModal = () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const $list = $('#cart-items-list');
            $list.empty();

            if (cart.length === 0) {
                $list.append('<li>Sepetiniz boş.</li>');
            } else {
                cart.forEach(item => {
                    $list.append(`<li>${item.title}</li>`);
                });
            }

            $('#modal-overlay').show();
            $('#cart-modal').show();
        };

        self.hideCartModal = () => {
            $('#modal-overlay').hide();
            $('#cart-modal').hide();
        };

        self.clearCart = () => {
            localStorage.removeItem('cart');
            $('#cart-items-list').empty();
            self.updateCartCount();
            self.showToast("Sepet temizlendi.");
        };


        self.updateCartCount = () => {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            $('#cart-count').text(cart.length);
        };


        $('#product-search').on('input', self.debounce(function() {
            const query = $(this).val().trim();
            let filteredProducts;

            if (query === "") {
                filteredProducts = self.products.slice(0, 18);
            } else {
                filteredProducts = self.products.filter(product => product.id.toString() === query);
            }

            $('#slider').slick('unslick');
            $(selectors.wrapper).empty();

            filteredProducts.forEach(product => {

                const card = `
          <div class="${classes.card}">
            <img src="${product.image}" class="${classes.image}" alt="Ürün">
            <div class="${classes.title}">${product.title}</div>
            <div class="${classes.price}">${product.price} $</div>
            <div class="button-group">
              <a class="${classes.showDetails}" data-fancybox data-src="#modal-${product.id}" href="javascript:;">
                Detay Göster
              </a>
              <button class="${classes.addToCartButton}" data-id="${product.id}">Sepete Ekle</button>
            </div>
          </div>
        `;
                $(selectors.wrapper).append(card);
            });


            if (window.Fancybox && Fancybox.bind) {
                Fancybox.bind("[data-fancybox]", {});
            }

            $('#slider').slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 0,
                speed: 3000,
                cssEase: 'linear',
                infinite: true,
                arrows: false,
                pauseOnHover: false
            });
        }, 300));

    };


    self.fetchProducts = () => {

        $('head').append(`
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css" />
          <script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.umd.js"></script>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"/>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"/>
          <script src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>
    `);

        $.getScript("https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox/fancybox.umd.js", function() {
            $.get('https://fakestoreapi.com/products', function(products) {
                const sliderContainer = $('#slider');
                self.products = products.slice(0, 18);

                self.products.forEach(product => {
                    const sliderItem = `
                        <div class="slider-item">
                          <a data-fancybox data-src="#modal-${product.id}" href="javascript:;">
                            <img src="${product.image}" alt="${product.title}" />
                          </a>
                        </div>
                      `;
                    sliderContainer.append(sliderItem);

                    const card = `
                        <div class="${classes.card}">
                          <img src="${product.image}" class="${classes.image}" alt="Ürün">
                          <div class="${classes.title}">${product.title}</div>
                          <div class="${classes.price}">${product.price} $</div>
                          <div class="button-group">
                            <a class="${classes.showDetails}" data-fancybox data-src="#modal-${product.id}" href="javascript:;">
                              Detay Göster
                            </a>
                            <button class="${classes.addToCartButton}" data-id="${product.id}">Sepete Ekle</button>
                          </div>
                        </div>
                      `;

                    const modal = `
                          <div style="display: none; max-width: 600px; padding: 20px;" id="modal-${product.id}">
                            <div style="display: flex; gap: 20px; align-items: flex-start;">
                              <img src="${product.image}" alt="${product.title}" style="width: 200px; height: auto; border-radius: 8px;" />
                              <div style="flex: 1;">
                                <h2 style="font-size: 20px; margin-bottom: 10px;">${product.title}</h2>
                                <p style="font-size: 14px; color: #555; margin-bottom: 10px;">${product.description}</p>
                                <p style="font-size: 18px; font-weight: bold; color: green;">${product.price} $</p>
                              </div>
                            </div>
                          </div>
                        `;

                    $(selectors.wrapper).append(card);
                    $('body').append(modal);
                });

                if (window.Fancybox && Fancybox.bind) {
                    Fancybox.bind("[data-fancybox]", {});
                } else {
                    console.warn("Fancybox yüklenemedi!");
                }

                $(document).off('click.addToCart').on('click.addToCart', selectors.addToCartButton, function() {
                    const id = Number($(this).data('id'));
                    self.setCartStorage(id);
                    self.showToast("Ürün sepete eklendi!");
                });

                $.getScript("https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js", function() {
                    $('#slider').slick({
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 0,
                        speed: 3000,
                        cssEase: 'linear',
                        infinite: true,
                        arrows: false,
                        pauseOnHover: false
                    });
                });
            });
        });
    };

    self.setCartStorage = (id) => {
        const product = self.products.find(p => p.id === id);
        if (!product) {
            console.warn("Ürün bulunamadı!");
            return;
        }
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        self.updateCartCount();
        console.log(`Ürün "${product.title}" sepete eklendi ve localStorage'a kaydedildi.`);
    };

    self.showToast = (message) => {
        const toast = $(`<div class="${classes.toast}">${message}</div>`);
        $(selectors.toastContainer).append(toast);
        setTimeout(() => {
            toast.fadeOut(1000, () => toast.remove());
        }, 3000);
    };

    $(document).ready(self.init);

})(jQuery);
let menuOpen = false
let cartOpen = false
let loading = false

window.addEventListener('DOMContentLoaded', () => {
 
    const menuBtn = document.querySelectorAll('.menu-btn')
    const menuLinks = document.querySelectorAll('.link-item')
    const cartToggleIcon = document.querySelectorAll('.cart-toggle-btn')
    const exampleATCs = document.querySelectorAll('.example-atc')
    const decrements = document.querySelectorAll('.cart-item .decrement')
    const incremenets = document.querySelectorAll('.cart-item .increment')
    const removes = document.querySelectorAll('.cart-item .remove')
    
    ////// event listeners ////// 

    // toggle menu drawer 
    menuBtn.forEach((btn) => {
        btn.addEventListener('click', () => {
            toggleMenuDrawer()
        })
    })

    // toggle cart drawer
    cartToggleIcon.forEach((btn) => {
      btn.addEventListener('click', () => {
        toggleCartDrawer()
      })
    })

    // decrement line item
    decrements.forEach((decrementBtn) => {
      decrementBtn.addEventListener('click', (e) => {
        const vid = e.target.closest('.quantity-container').dataset.variantId
        const currentQuantity = Number(e.target.closest('.quantity-container').dataset.quantity)
        decrementLineItem(vid, currentQuantity)
      })
    })

    // hover menu drawer first link
    menuLinks[0].addEventListener('mouseover', () => {
        document.querySelector('.kin-first-hover').classList.add('hovered')
    })
    menuLinks[0].addEventListener('mouseout', () => {
        document.querySelector('.kin-first-hover').classList.remove('hovered')
    })

    exampleATCs.forEach((atc) => {
        atc.addEventListener('click', (e) => {  
          addVariantToCart(e.target.dataset.variantId)
      })
    })
})

// even delegation for ajax cart 
window.addEventListener('click', (e) => {

  const el = e.target 

  // decrement 
  if(el.classList.contains('decrement')) {
    const vid = e.target.closest('.quantity-container').dataset.variantId
    const currentQuantity = Number(e.target.closest('.quantity-container').dataset.quantity)
    decrementLineItem(vid, currentQuantity)
  }

  // increment
  if(el.classList.contains('increment')) {
    const vid = e.target.closest('.quantity-container').dataset.variantId
    const currentQuantity = Number(e.target.closest('.quantity-container').dataset.quantity)
    incrementLineItem(vid, currentQuantity)
  }

  // remove
  if(el.classList.contains('remove')) {
    const vid = e.target.parentElement.querySelector('.quantity-container').dataset.variantId  
    removeLineItem(vid)
  }

})


// menu functions //

function toggleMenuDrawer(){
    cartOpen ? toggleCartDrawer() : ''
    document.querySelector('.menu-drawer').classList.toggle('menu-open')
    menuOpen = !menuOpen
    toggleBodyScroll()
}

function toggleCartDrawer(){
    menuOpen ? toggleMenuDrawer() : ''
    document.querySelector('.cart-drawer').classList.toggle('cart-open')
    cartOpen = !cartOpen
    toggleBodyScroll()
}
// disable scrolling
function toggleBodyScroll(){
    document.body.style.overflow = document.body.style.overflow === "hidden" ?  "auto" : "hidden"
} 

// AJAX cart / ATC, increment, decrement, remove functions 

async function masterCartRerender(){

    const cart = await getCart()
    console.log('//// new cart below ')
    console.log(cart)

    const newSubtotalEl = `
      <div class="subtotal-container ${cart.items.length === 0 ? 'hide' : ''}">
        <span class="subtotal-text">SUBTOTAL</span>
        <span class="subtotal-price">$${formatMoneyInt(cart.total_price)}</span>
      </div>
    `
    let itemsTemplate = ''

    // clear old cart items
    document.querySelectorAll('.cart-item').forEach((item) => {
      item.remove()
    })

    if(cart.items.length > 0) {
      // items exist in cart
      cart.items.forEach((item) => {
        const itemTemplate = `
        <div class="cart-item">
            <div class="item-image-container">
                <a href="${item.url}">
                    <img class="item-image" src="${ item.image }}">
                </a>
            </div>
            <div class="item-info">
                <a href="${ item.url }">
                    <div class="item-title">${ item.title }</div>
                </a>
                <div class="variant-title-price">
                    ${ item.variant_title === null ? '' : item.variant_title + ',' }
                    $${formatMoneyInt(item.final_price )}
                    <div class="quantity-container" data-quantity="${ item.quantity }" data-variant-id="${ item.variant_id }">
                        <img class="decrement" src="https://cdn.shopify.com/s/files/1/0756/2769/2310/files/39384297500c145afa524e1721a04663.svg?v=1683610701">
                        <span class="quantity">
                            ${ item.quantity }
                        </span>
                        <img class="increment" src="https://cdn.shopify.com/s/files/1/0756/2769/2310/files/18dddcc9cf53b547eaf0f76c308502f6.svg?v=1683610701">     
                    </div>
                </div>
                <img class="remove" src="https://cdn.shopify.com/s/files/1/0756/2769/2310/files/Group_22.svg?v=1683609354">
            </div>
          </div>
        `
        document.querySelector('.cart-items').classList.remove('cart-empty')
        document.querySelector('.cart-bottom').innerHTML = `<div class="checkout"></div><div class="line"></div>`
        itemsTemplate += itemTemplate 
      })
    } else {

      // empty cart, reset 
      document.querySelector('.cart-items').classList.add('cart-empty')
      document.querySelector('.cart-bottom').innerHTML = `<div class="start-shopping"></div>`

      itemsTemplate += `
        <div class="cart-empty-text">
          Your cart is thirsty.
        </div>
      `
    }

    itemsTemplate += newSubtotalEl

    document.querySelector('.cart-items').innerHTML = itemsTemplate
    console.log(document.querySelector('.subtotal-container .subtotal-price'))

    loading = false
    document.querySelector('.cart-loading-opacity').classList.remove('loading')
}

async function addVariantToCart(vid) {

    if (vid === undefined ) return

    cartLoading()

    let formData = {
      'items': [
        {
          'id': vid,
          'quantity': 1
        }
      ]
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (response.ok) {
        console.log('success')
        if(!cartOpen) {
          toggleCartDrawer()
        }
        // master cart rerender
        masterCartRerender()
      } else {
        alert('There was a problem adding this item to cart')
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    })
}

async function incrementLineItem(vid, currentQuantity) {

  if (vid === undefined || loading) return

  cartLoading()

  const data = { 
    updates: {
      [parseInt(vid)]: currentQuantity += 1
    }
  }

  fetch(`/cart/update.js`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
  .then((res) => {
      if (res.ok) {
        masterCartRerender()
      }
  })
  .catch((error) => {
    console.error('Error:', error);
  })
}

async function decrementLineItem(vid, currentQuantity) {
  if(currentQuantity === 1) {
    removeLineItem(vid)
    return
  } else {
    if (vid === undefined || loading) return

    cartLoading()

    const data = {
      updates: {
        [parseInt(vid)]: currentQuantity -= 1
      }
    }

    fetch(`/cart/update.js`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then((res) => {
        if (res.ok) {
          masterCartRerender()
        }
    })
    .catch((error) => {
      console.error('Error:', error);
    })
  }
}

async function removeLineItem(vid) {
  
  if (vid === undefined || loading) return

  cartLoading()

  const data = {
    updates: {
      [parseInt(vid)]: 0
    }
  }

  fetch(`/cart/update.js`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
  })
  .then((res) => {
      if (res.ok) {
        masterCartRerender()
      }
  })

}

// utility 

function formatMoneyInt(int) {

    if (int === null) return
    if (int === 0) return int

    let s = int.toString().split('').reverse()
    s.splice(2, 0, '.')
    s.reverse()
    let f = s.join('')

    return Math.ceil(f)
}

async function getCart() {
    const res = await fetch('/cart.js')
    const cart = await res.json()
    return cart
}

function cartLoading(){

  const loadingEl = document.querySelector('.cart-loading-opacity')
  const bottleDiv = document.createElement('img')

  bottleDiv.src = 'https://cdn.shopify.com/s/files/1/0756/2769/2310/files/dl_product_1.png?v=1683573080'
  loading = true 

  loadingEl.classList.add('loading')
  loadingEl.appendChild(bottleDiv)
  
  let rotationAngle = 0;
  const rotationIncrement = 360 / 400;
  const bottleDom = document.querySelector('.cart-loading-opacity img')
  const interval = setInterval(() => {
    rotationAngle += rotationIncrement;
    bottleDom.style.transform = `rotate(${rotationAngle}deg)`;
    if (!loading) {
      clearInterval(interval);
      bottleDom.remove()
    }
  }, 1);

}


let menuOpen = false
let cartOpen = false

window.addEventListener('DOMContentLoaded', () => {
 
    const menuBtn = document.querySelectorAll('.menu-btn')
    const menuLinks = document.querySelectorAll('.link-item')
    const cartToggleIcon = document.querySelectorAll('.cart-toggle-btn')
    const exampleATCs = document.querySelectorAll('.example-atc')
    
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

async function masterCartRerender(cartItems){
    const cart = await getCart()
    console.log(cart)
}

async function addVariantToCart(vid) {

    if (vid === undefined) return

    // set loading state

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

async function incrementLineItem(vid, curentQuantity) {

}

async function decrementLineItem(vid, currentQuantity) {

}

async function removeLineItem(vid) {

}


// utility 

function formatMoneyInt(int) {

    if (int === null) return
    if (int === 0) return int

    let s = int.toString().split('').reverse()
    s.splice(2, 0, '.')
    s.reverse()
    let f = s.join('')
    return f
}

async function getCart() {
    const res = await fetch('/cart.js')
    const cart = await res.json()
    return cart
}

// for testing 
window.addEventListener('click', (e) => {
    console.log(e.target)
})

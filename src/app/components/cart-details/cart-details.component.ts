import { CartService } from './../../services/cart.service';
import { CartItem } from './../../common/cart-item';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css'],
})
export class CartDetailsComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.listCartDetails();
  }
  // list the cart items and details
  listCartDetails() {
    //get a handle to the cart items
    this.cartItems = this.cartService.cartItems;
    //subscribe to the cart totalPrice
    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));
    //subscribe to the cart the totalQuantity
    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );
    //compute cart total price and quantity
    this.cartService.computeCartTotals();
  }
  //increment method for the plus button
  incrementQuantity(theCartItem: CartItem) {
    this.cartService.addToCart(theCartItem);
  }
  //decrement method for the plus button
  decremetnQuantity(theCartItem: CartItem) {
    this.cartService.decrementQuantity(theCartItem);
  }
  // remove the items from the cart
  remove(theCartItem: CartItem) {
    this.cartService.remove(theCartItem);
  }
}

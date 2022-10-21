import { Router } from '@angular/router';
import { CheckoutService } from './../../services/checkout.service';
import { CartService } from './../../services/cart.service';
import { Country } from './../../common/country';
import { Luv2ShopFormService } from './../../services/luv2-shop-form.service';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { State } from 'src/app/common/state';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup?: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private luv2ShopFormService: Luv2ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reviewCartDetails();
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
        ]),
        cardNumber: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{16}'),
        ]),
        securityCode: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{3}'),
        ]),
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });
    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log('startMonth: ' + startMonth);
    this.luv2ShopFormService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => {
        console.log('Retrieved credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      });
    //populate credit card years
    this.luv2ShopFormService.getCreditCardYears().subscribe((data) => {
      console.log('Retrieved credit card years: ' + JSON.stringify(data));
      this.creditCardYears = data;
    });
    // populate the countries
    this.luv2ShopFormService.getCountries().subscribe((data) => {
      console.log('retrieved countries: ' + JSON.stringify(data));
      this.countries = data;
    });
  }
  // this method will subscribe to the subjects of cart service
  reviewCartDetails() {
    //subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );
    //subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));
  }
  // on submit of the form for checkout
  onSubmit() {
    console.log('Handling the submit button');
    if (this.checkoutFormGroup?.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;
    //create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(
      (tempCartItem) => new OrderItem(tempCartItem)
    );
    //set up purchase
    let purchase = new Purchase();
    // populate purchase-customer
    purchase.customer = this.checkoutFormGroup?.controls['customer'].value;

    //populate purchase- shipping address
    purchase.shippingAddress =
      this.checkoutFormGroup?.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(
      JSON.stringify(purchase.shippingAddress?.state)
    );
    const shippingCountry: Country = JSON.parse(
      JSON.stringify(purchase.shippingAddress?.country)
    );
    purchase.shippingAddress!.state = shippingState.name;
    purchase.shippingAddress!.country = shippingCountry.name;
    // populate purchase- billing address
    purchase.billingAddress =
      this.checkoutFormGroup?.controls['billingAddress'].value;
    const billingState: State = JSON.parse(
      JSON.stringify(purchase.billingAddress?.state)
    );
    const billingCountry: Country = JSON.parse(
      JSON.stringify(purchase.billingAddress?.country)
    );
    purchase.billingAddress!.state = billingState.name;
    purchase.billingAddress!.country = billingCountry.name;
    //populate purchase-order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;
    // call rest api via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response) => {
        alert(
          `Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`
        );
        //reset cart
        this.resetCart();
      },
      error: (err) => {
        alert(`There was an error: ${err.message}`);
      },
    });
  }
  // reset cart
  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    //reset the form
    this.checkoutFormGroup?.reset();
    //navigate back to the product page
    this.router.navigateByUrl('/products');
  }
  // checkbox to copy billing to shipping
  copyShippingAddressToBillingAddress(e: any) {
    if (e.target.checked) {
      this.checkoutFormGroup?.controls['billingAddress'].setValue(
        this.checkoutFormGroup?.controls['shippingAddress'].value
      );
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup?.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }
  // start the month appropriately in the credit card form
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup?.get('creditCard');
    const curretnYear = new Date().getFullYear();
    const selectedyear = Number(creditCardFormGroup?.value['expirationYear']);
    // if the current year equals the selected year , then start with the current month
    let startMonth: number;
    if (curretnYear === selectedyear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.luv2ShopFormService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => {
        console.log('Retrieved credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      });
  }
  // get the states with the option of passing billingAddress or shippingAddress
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup?.get(formGroupName);
    const countryCode = formGroup?.value['country'].code;
    // this is just for degugging but is not required for code
    const countryName = formGroup?.value['country'].name;
    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);
    this.luv2ShopFormService.getStates(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }
      // select the first item by default
      formGroup?.get('state')?.setValue(data[0]);
    });
  }
  // getter for firstName
  get firstName() {
    return this.checkoutFormGroup?.get('customer.firstName');
  }
  // getter for lastName
  get lastName() {
    return this.checkoutFormGroup?.get('customer.lastName');
  }
  // getter for email
  get email() {
    return this.checkoutFormGroup?.get('customer.email');
  }
  //////////////////////////////////////SHIPPING///////////////////////////////////////////
  // getter for shippingAddressStreet
  get shippingAddressStreet() {
    return this.checkoutFormGroup?.get('shippingAddress.street');
  }
  // getter for shippingAddressCity
  get shippingAddressCity() {
    return this.checkoutFormGroup?.get('shippingAddress.city');
  }
  // getter for shippingAddressState
  get shippingAddressState() {
    return this.checkoutFormGroup?.get('shippingAddress.state');
  }
  // getter for shippingAddressZipCode
  get shippingAddressZipCode() {
    return this.checkoutFormGroup?.get('shippingAddress.zipCode');
  }
  // getter for shippingAddressCountry
  get shippingAddressCountry() {
    return this.checkoutFormGroup?.get('shippingAddress.country');
  }
  //////////////////////////////////////BILLING///////////////////////////////////////////////////////
  // getter for billingAddressStreet
  get billingAddressStreet() {
    return this.checkoutFormGroup?.get('billingAddress.street');
  }
  // getter for billingAddressCity
  get billingAddressCity() {
    return this.checkoutFormGroup?.get('billingAddress.city');
  }
  // getter for billingAddressState
  get billingAddressState() {
    return this.checkoutFormGroup?.get('billingAddress.state');
  }
  // getter for billingAddressZipCode
  get billingAddressZipCode() {
    return this.checkoutFormGroup?.get('billingAddress.zipCode');
  }
  // getter for billingAddressCountry
  get billingAddressCountry() {
    return this.checkoutFormGroup?.get('billingAddress.country');
  }
  //////////////////////////////////////CREDIT CARD////////////////////////////
  // getter for creditCardType
  get creditCardType() {
    return this.checkoutFormGroup?.get('creditCard.cardType');
  }
  // getter for creditCardNameOnCard
  get creditCardNameOnCard() {
    return this.checkoutFormGroup?.get('creditCard.nameOnCard');
  }
  // getter for creditCardNumber
  get creditCardNumber() {
    return this.checkoutFormGroup?.get('creditCard.cardNumber');
  }
  // getter for creditSecurityCode
  get creditCardSecurityCode() {
    return this.checkoutFormGroup?.get('creditCard.securityCode');
  }
}

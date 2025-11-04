import CartItem from 'models/CartItem'

export type CustomerDetails = {
  name: string
  emailAddress: string
  phoneNumber: string
}

export type ShippingDetails = {
  address: string
  city: string
  country: string
  zipCode: string
}

export type PaymentDetails = {
  method: 'e-Money' | 'Cash on Delivery'
  eMoneyNumber?: string
  eMoneyPin?: string
}

export type OrderTotals = {
  subtotal: number
  shipping: number
  tax: number
  grandTotal: number
}

export type OrderPayload = {
  customer: CustomerDetails
  shipping: ShippingDetails
  payment: PaymentDetails
  items: CartItem[]
  totals: OrderTotals
}

export type StoredOrder = OrderPayload & {
  orderId: string
  orderNumber: string
  createdAt: string
  status: string
}

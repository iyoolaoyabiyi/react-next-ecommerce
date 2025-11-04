import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  orders: defineTable({
    customer: v.object({
      name: v.string(),
      emailAddress: v.string(),
      phoneNumber: v.string(),
    }),
    shipping: v.object({
      address: v.string(),
      city: v.string(),
      country: v.string(),
      zipCode: v.string(),
    }),
    payment: v.object({
      method: v.string(),
      eMoneyNumber: v.optional(v.string()),
      eMoneyPin: v.optional(v.string()),
    }),
    items: v.array(
      v.object({
        id: v.number(),
        shortName: v.string(),
        cartImage: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    totals: v.object({
      subtotal: v.number(),
      shipping: v.number(),
      tax: v.number(),
      grandTotal: v.number(),
    }),
    orderNumber: v.string(),
    status: v.string(),
    createdAt: v.string(),
  }).index('by_created_at', ['createdAt']),
})

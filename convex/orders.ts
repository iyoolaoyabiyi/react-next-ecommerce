import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const ORDER_PREFIX = 'AUD'

const createOrderNumber = (createdAt: string, totalOrdersToday: number) => {
  const date = new Date(createdAt)
  const dateStamp = `${date.getUTCFullYear()}${(date.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}${date.getUTCDate().toString().padStart(2, '0')}`
  const sequence = (totalOrdersToday + 1).toString().padStart(4, '0')
  return `${ORDER_PREFIX}-${dateStamp}-${sequence}`
}

export const createOrder = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const createdAt = new Date().toISOString()

    const startOfDay = new Date(createdAt)
    startOfDay.setUTCHours(0, 0, 0, 0)
    const ordersToday = await ctx.db
      .query('orders')
      .withIndex('by_created_at')
      .filter(q => q.gte(q.field('createdAt'), startOfDay.toISOString()))
      .collect()

    const orderNumber = createOrderNumber(createdAt, ordersToday.length)

    const orderId = await ctx.db.insert('orders', {
      ...args,
      orderNumber,
      status: 'received',
      createdAt,
    })

    return {
      orderId,
      orderNumber,
      createdAt,
    }
  },
})

export const getOrder = query({
  args: {
    orderId: v.id('orders'),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId)
    if (!order) {
      return null
    }
    return {
      ...order,
      orderId: args.orderId,
    }
  },
})

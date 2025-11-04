import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import type { OrderPayload, StoredOrder } from 'models/Order'
import { createOrderInConvex, getOrderFromConvex } from 'lib/convex'
import { sendOrderConfirmationEmail } from 'lib/email'

const cartItemSchema = z.object({
  id: z.number(),
  shortName: z.string(),
  cartImage: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
})

const orderPayloadSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    emailAddress: z.string().email(),
    phoneNumber: z.string().min(4),
  }),
  shipping: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    zipCode: z.string().min(1),
  }),
  payment: z.object({
    method: z.enum(['e-Money', 'Cash on Delivery']),
    eMoneyNumber: z.string().optional(),
    eMoneyPin: z.string().optional(),
  }),
  items: z.array(cartItemSchema).min(1),
  totals: z.object({
    subtotal: z.number().nonnegative(),
    shipping: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    grandTotal: z.number().nonnegative(),
  }),
})

type CheckoutResponse = {
  orderId: string
  orderNumber: string
  createdAt: string
}

const ensureOrderForEmail = async (
  orderId: string,
  fallback: OrderPayload,
  meta: { orderNumber: string; createdAt: string }
): Promise<StoredOrder> => {
  const storedOrder = await getOrderFromConvex(orderId)
  if (storedOrder) {
    return storedOrder
  }

  return {
    ...fallback,
    ...meta,
    orderId,
    status: 'received',
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckoutResponse | { message: string }>
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const payload = orderPayloadSchema.parse(req.body) as OrderPayload

    const { orderId, orderNumber, createdAt } = await createOrderInConvex(
      payload
    )

    const orderForEmail = await ensureOrderForEmail(orderId, payload, {
      orderNumber,
      createdAt,
    })

    await sendOrderConfirmationEmail(orderForEmail)

    return res.status(200).json({
      orderId,
      orderNumber,
      createdAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: `Invalid checkout payload: ${error.issues
          .map(issue => issue.message)
          .join(', ')}`,
      })
    }

    const message =
      error instanceof Error ? error.message : 'Unexpected server error'

    return res.status(500).json({
      message,
    })
  }
}

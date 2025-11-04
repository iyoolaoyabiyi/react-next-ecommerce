import type { NextApiRequest, NextApiResponse } from 'next'

import { getOrderFromConvex } from 'lib/convex'
import type { StoredOrder } from 'models/Order'

type ErrorResponse = { message: string }

const notFoundMessage = 'Order not found'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StoredOrder | ErrorResponse>
): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid order id' })
  }

  try {
    const order = await getOrderFromConvex(id)
    if (!order) {
      return res.status(404).json({ message: notFoundMessage })
    }
    return res.status(200).json(order)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to retrieve order'
    return res.status(500).json({ message })
  }
}

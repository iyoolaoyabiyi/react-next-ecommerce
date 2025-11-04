import fetch, { Headers, Request, Response } from 'node-fetch'
import { ConvexHttpClient } from 'convex/browser'

import type { OrderPayload, StoredOrder } from 'models/Order'

type ConvexCallType = 'mutation' | 'query' | 'action'

type CreateOrderResponse = {
  orderId?: string
  _id?: string
  orderNumber: string
  createdAt: string
}

const normalizeBaseUrl = (raw: string): string =>
  raw.endsWith('/') ? raw.slice(0, -1) : raw

const getConvexBaseUrl = (): string => {
  const explicitBaseUrl =
    process.env.CONVEX_BASE_URL || process.env.NEXT_PUBLIC_CONVEX_URL
  if (explicitBaseUrl) return normalizeBaseUrl(explicitBaseUrl)

  const deployment = process.env.CONVEX_DEPLOYMENT
  if (deployment) {
    const deploymentId = deployment.includes(':')
      ? deployment.split(':')[1]
      : deployment
    return normalizeBaseUrl(`https://${deploymentId}.convex.cloud`)
  }

  throw new Error('Convex base URL is not configured.')
}

if (typeof globalThis.fetch !== 'function') {
  ;(globalThis as any).fetch = fetch
  ;(globalThis as any).Headers = Headers
  ;(globalThis as any).Request = Request
  ;(globalThis as any).Response = Response
}

let cachedClient: ConvexHttpClient | null = null

const getConvexClient = (): ConvexHttpClient => {
  const baseUrl = getConvexBaseUrl()

  if (!cachedClient) {
    cachedClient = new ConvexHttpClient(baseUrl)
  } else if (cachedClient.url !== baseUrl) {
    cachedClient = new ConvexHttpClient(baseUrl)
  }

  const functionKey = process.env.CONVEX_FUNCTION_KEY

  if (functionKey) {
    cachedClient.setAuth(functionKey)
  } else {
    cachedClient.clearAuth()
  }

  return cachedClient
}

const callConvex = async <T>(
  path: string,
  type: ConvexCallType,
  payload: unknown
): Promise<T> => {
  const client = getConvexClient()
  const args = (payload ?? {}) as Record<string, unknown>

  try {
    switch (type) {
      case 'mutation':
        return (await client.mutation(path as any, args)) as T
      case 'query':
        return (await client.query(path as any, args)) as T
      case 'action':
      default:
        return (await client.action(path as any, args)) as T
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Convex ${type} "${path}" failed: ${reason}`)
  }
}

export const createOrderInConvex = async (
  payload: OrderPayload
): Promise<{ orderId: string; orderNumber: string; createdAt: string }> => {
  const result = await callConvex<CreateOrderResponse>(
    'orders:createOrder',
    'mutation',
    payload
  )

  const orderId = 'orderId' in result ? result.orderId : result._id

  if (!orderId) {
    throw new Error('Convex createOrder response did not include an order id.')
  }

  return {
    orderId: orderId.toString(),
    orderNumber: result.orderNumber,
    createdAt: result.createdAt,
  }
}

export const getOrderFromConvex = async (
  orderId: string
): Promise<StoredOrder | null> => {
  const result = await callConvex<StoredOrder | null>(
    'orders:getOrder',
    'query',
    {
      orderId,
    }
  )

  if (!result) {
    return null
  }

  return {
    ...result,
    orderId: result.orderId || orderId,
  }
}

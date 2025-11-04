import { randomUUID } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

import { createOrderInConvex, getOrderFromConvex } from '../src/lib/convex'
import type { OrderPayload } from '../src/models/Order'

const loadEnvFile = (filename: string) => {
  const filePath = path.resolve(process.cwd(), filename)
  if (!existsSync(filePath)) return

  const lines = readFileSync(filePath, 'utf8').split('\n')
  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      return
    }
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      return
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const rawValue = trimmed.slice(separatorIndex + 1).trim()
    const value = rawValue.replace(/^"(.*)"$/, '$1')

    if (!(key in process.env)) {
      process.env[key] = value
    }
  })
}

loadEnvFile('.env')
loadEnvFile('.env.local')

// if (!process.env.CONVEX_BASE_URL && !process.env.NEXT_PUBLIC_CONVEX_URL) {
//   process.env.CONVEX_BASE_URL = 'http://localhost:8187'
// }

const buildTestOrder = (): OrderPayload => {
  const runId = randomUUID().slice(0, 8)

  return {
    customer: {
      name: `Test Runner ${runId}`,
      emailAddress: `runner-${runId}@example.com`,
      phoneNumber: '+15550000000',
    },
    shipping: {
      address: '123 Test Street',
      city: 'Testville',
      country: 'Testland',
      zipCode: '0000-9876',
    },
    payment: {
      method: 'Cash on Delivery',
    },
    items: [
      {
        id: 999_000 + Math.floor(Math.random() * 1000),
        shortName: 'Test Item',
        cartImage: '/tests/test-item.png',
        price: 1,
        quantity: 1,
      },
    ],
    totals: {
      subtotal: 1,
      shipping: 0,
      tax: 0,
      grandTotal: 1,
    },
  }
}

const ensureEnv = () => {
  const explicitBaseUrl =
    process.env.CONVEX_BASE_URL || process.env.NEXT_PUBLIC_CONVEX_URL

  if (!explicitBaseUrl) {
    throw new Error(
      'Set CONVEX_BASE_URL or NEXT_PUBLIC_CONVEX_URL before running this test.'
    )
  }

  return explicitBaseUrl
}

const run = async () => {
  ensureEnv()

  const orderPayload = buildTestOrder()
  console.log('Creating test order in Convex...')
  const created = await createOrderInConvex(orderPayload)
  console.log('Order created:', created)

  console.log('Fetching order back from Convex...')
  const stored = await getOrderFromConvex(created.orderId)

  if (!stored) {
    throw new Error('Created order could not be fetched back from Convex.')
  }

  console.log('Order retrieved successfully.')
  console.log(JSON.stringify(stored, null, 2))
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})

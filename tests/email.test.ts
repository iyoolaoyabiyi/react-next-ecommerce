import nodemailer from 'nodemailer'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

import { sendOrderConfirmationEmail } from '../src/lib/email'
import type { StoredOrder } from '../src/models/Order'

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

const useLiveSmtp = process.env.SMTP_TEST_LIVE === 'true'

const ensureLiveEnv = () => {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
  const missing = required.filter(name => !process.env[name])

  if (missing.length) {
    throw new Error(
      `Missing SMTP environment variables: ${missing.join(
        ', '
      )}. Update .env.local before running with SMTP_TEST_LIVE=true.`
    )
  }
}

const setupMockTransport = () => {
  const originalCreateTransport = nodemailer.createTransport

  process.env.SMTP_HOST ||= 'mock-host'
  process.env.SMTP_PORT ||= '587'
  process.env.SMTP_USER ||= 'mock-user'
  process.env.SMTP_PASS ||= 'mock-pass'

  const mockTransport = {
    async sendMail(message: Record<string, unknown>) {
      console.log('Mock email payload:')
      console.log(JSON.stringify(message, null, 2))
      return { messageId: 'mocked-message-id' }
    },
  }

  ;(nodemailer as any).createTransport = () => mockTransport

  return () => {
    ;(nodemailer as any).createTransport = originalCreateTransport
  }
}

const buildSampleOrder = (): StoredOrder => ({
  orderId: 'test-order-id',
  orderNumber: 'TEST-0001',
  createdAt: new Date().toISOString(),
  status: 'received',
  customer: {
    name: 'Test Runner',
    emailAddress: process.env.EMAIL_TO as string,
    phoneNumber: '+2348123456789',
  },
  shipping: {
    address: '123 Test Street',
    city: 'Testville',
    country: 'Testland',
    zipCode: '00000',
  },
  payment: {
    method: 'Cash on Delivery',
  },
  items: [
    {
      id: 1,
      shortName: 'Mock Item',
      cartImage: '/tests/mock-item.png',
      price: 99,
      quantity: 1,
    },
  ],
  totals: {
    subtotal: 99,
    shipping: 0,
    tax: 0,
    grandTotal: 99,
  },
})

const run = async () => {
  let restoreTransport: (() => void) | null = null

  if (useLiveSmtp) {
    ensureLiveEnv()
  } else {
    restoreTransport = setupMockTransport()
    console.log(
      'SMTP_TEST_LIVE is not set. Using mocked nodemailer transport for dry run.'
    )
  }

  const order = buildSampleOrder()
  await sendOrderConfirmationEmail(order)

  if (restoreTransport) {
    restoreTransport()
  }

  console.log('Email test completed successfully.')
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})

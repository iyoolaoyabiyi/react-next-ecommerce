import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

import type { StoredOrder } from 'models/Order'
import {
  orderConfirmationHtml,
  orderConfirmationSubject,
} from 'emails/orderConfirmationTemplate'

type Transporter = ReturnType<typeof nodemailer.createTransport>

let cachedTransporter: Transporter | null = null
let envLoaded = false

const loadEnvFile = (filename: string) => {
  const filepath = path.resolve(process.cwd(), filename)
  if (!fs.existsSync(filepath)) return

  const lines = fs.readFileSync(filepath, 'utf8').split('\n')
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

const ensureEmailEnv = () => {
  if (envLoaded) return
  envLoaded = true

  if (typeof window !== 'undefined') {
    // Environment variables should already be injected for any client bundle.
    return
  }

  loadEnvFile('.env')
  loadEnvFile('.env.local')
}

const createTransporter = (): Transporter => {
  if (cachedTransporter) {
    return cachedTransporter
  }

  ensureEmailEnv()

  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !port || !user || !pass) {
    throw new Error(
      'SMTP credentials are not fully configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.'
    )
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  })

  return cachedTransporter
}

export const sendOrderConfirmationEmail = async (
  order: StoredOrder
): Promise<void> => {
  const fromAddress = process.env.EMAIL_FROM
  const transporter = createTransporter()

  const to = order.customer.emailAddress
  const subject = orderConfirmationSubject(order)
  const html = orderConfirmationHtml(order)

  await transporter.sendMail({
    to,
    from: fromAddress ?? `Audiophile <${process.env.SMTP_USER}>`,
    subject,
    html,
  })
}

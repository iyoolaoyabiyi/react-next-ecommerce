import type { StoredOrder } from 'models/Order'

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

export const orderConfirmationSubject = (order: StoredOrder): string =>
  `Your Audiophile order ${order.orderNumber} is confirmed`

export const orderConfirmationHtml = (order: StoredOrder): string => {
  const itemsRows = order.items
    .map(
      item => `
        <tr>
          <td style="padding:8px 0;">
            <div style="font-weight:600;text-transform:uppercase;">${
              item.shortName
            }</div>
            <div style="font-size:14px;color:#737373;">x${item.quantity}</div>
          </td>
          <td style="padding:8px 0;text-align:right;font-weight:600;">
            ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>
      `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Order Confirmation</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f2f2f2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:32px 28px 12px;">
                    <h1 style="font-size:24px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1.5px;">Thank you for your order</h1>
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
                      Hi ${order.customer.name},
                      <br />
                      We’re excited to let you know that we’ve received your order <strong>${
                        order.orderNumber
                      }</strong>.
                    </p>
                    <div style="border:1px solid #e6e6e6;border-radius:8px;padding:20px;margin-bottom:20px;">
                      <h2 style="font-size:16px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Order summary</h2>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        ${itemsRows}
                      </table>
                      <div style="border-top:1px solid #e6e6e6;margin:16px 0;"></div>
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td style="text-transform:uppercase;color:#737373;padding:4px 0;">Subtotal</td>
                          <td style="text-align:right;padding:4px 0;">${formatCurrency(
                            order.totals.subtotal
                          )}</td>
                        </tr>
                        <tr>
                          <td style="text-transform:uppercase;color:#737373;padding:4px 0;">Shipping</td>
                          <td style="text-align:right;padding:4px 0;">${formatCurrency(
                            order.totals.shipping
                          )}</td>
                        </tr>
                        <tr>
                          <td style="text-transform:uppercase;color:#737373;padding:4px 0;">Tax</td>
                          <td style="text-align:right;padding:4px 0;">${formatCurrency(
                            order.totals.tax
                          )}</td>
                        </tr>
                        <tr>
                          <td style="text-transform:uppercase;font-weight:700;padding:10px 0;">Grand Total</td>
                          <td style="text-align:right;font-weight:700;padding:10px 0;">${formatCurrency(
                            order.totals.grandTotal
                          )}</td>
                        </tr>
                      </table>
                    </div>
                    <div style="border:1px solid #e6e6e6;border-radius:8px;padding:20px;margin-bottom:20px;">
                      <h2 style="font-size:16px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">Shipping to</h2>
                      <p style="margin:0;font-size:15px;line-height:1.6;">
                        ${order.shipping.address}<br />
                        ${order.shipping.city}, ${order.shipping.zipCode}<br />
                        ${order.shipping.country}
                      </p>
                    </div>
                    <p style="margin:0 0 24px;font-size:15px;">Need to make a change? Reply to this email or reach us at <a href="mailto:support@audiophile.shop" style="color:#d87d4a;text-decoration:none;">support@audiophile.shop</a>.</p>
                    <p style="margin:0;font-size:15px;">
                      <a href="${
                        process.env.NEXT_PUBLIC_APP_URL ??
                        'https://audiophile.example.com'
                      }/order-confirmation?orderId=${
    order.orderId
  }" style="display:inline-block;padding:12px 24px;background-color:#d87d4a;color:#ffffff;border-radius:4px;text-decoration:none;text-transform:uppercase;font-weight:600;">View your order</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

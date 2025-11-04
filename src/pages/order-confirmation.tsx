import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  List,
  Stack,
  Text,
} from '@chakra-ui/react'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { GetServerSideProps } from 'next'

import SummaryItem from 'components/molecules/SummaryItem'
import SummaryLine from 'components/molecules/SummaryLine'
import type { StoredOrder } from 'models/Order'
import { getOrderFromConvex } from 'lib/convex'

type OrderConfirmationProps = {
  order: StoredOrder | null
  orderId: string | null
}

const OrderConfirmationPage = ({
  order: initialOrder,
  orderId,
}: OrderConfirmationProps): JSX.Element => {
  const [order, setOrder] = useState<StoredOrder | null>(initialOrder)

  useEffect(() => {
    if (order) return

    try {
      const cached = sessionStorage.getItem('audiophile:lastOrder')
      if (!cached) return
      const parsed = JSON.parse(cached) as StoredOrder
      if (!orderId || parsed.orderId === orderId) {
        setOrder(parsed)
      }
    } catch (error) {
      console.error('Unable to hydrate order from sessionStorage', error)
    }
  }, [order, orderId])

  const totals = useMemo(() => {
    if (!order) {
      return []
    }

    return [
      { name: 'total', amount: order.totals.subtotal },
      { name: 'shipping', amount: order.totals.shipping },
      { name: 'vat (included)', amount: order.totals.tax },
      {
        name: 'Grand Total',
        amount: order.totals.grandTotal,
        grandTotal: true,
      },
    ]
  }, [order])

  return (
    <>
      <Head>
        <title>Order Confirmation | Audiophile</title>
      </Head>
      <Container maxW="container.lg" px={6} py={{ base: '3rem', md: '4rem' }}>
        {order ? (
          <Stack spacing={{ base: '2rem', md: '2.5rem' }}>
            <Box>
              <Heading
                as="h1"
                fontSize={{ base: '2rem', md: '2.5rem' }}
                textTransform="uppercase"
                mb="0.75rem"
              >
                Thank you for your order
              </Heading>
              <Text color="textLight" maxW="32rem">
                We sent a confirmation email to {order.customer.emailAddress}.
                Your order number is <strong>{order.orderNumber}</strong>.
              </Text>
            </Box>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: '1.5rem', md: '2rem' }}
              align={{ md: 'stretch' }}
            >
              <Box
                bg="gray"
                borderRadius="0.5rem"
                flex={{ md: '1 1 55%' }}
                px={{ base: '1.5rem', md: '2rem' }}
                py={{ base: '1.5rem', md: '2rem' }}
              >
                <Text
                  fontWeight="bold"
                  fontSize="0.875rem"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  mb="1rem"
                >
                  Items
                </Text>
                <List as="ul" spacing="1.25rem">
                  {order.items.map(item => (
                    <SummaryItem key={item.id} item={item} />
                  ))}
                </List>
                <Box mt="1.5rem">
                  <Text
                    fontWeight="bold"
                    fontSize="0.875rem"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    mb="0.5rem"
                  >
                    Shipping to
                  </Text>
                  <Text color="textLight">
                    {order.shipping.address}
                    <br />
                    {order.shipping.city}, {order.shipping.zipCode}
                    <br />
                    {order.shipping.country}
                  </Text>
                </Box>
                <Box mt="1.5rem">
                  <Text
                    fontWeight="bold"
                    fontSize="0.875rem"
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    mb="0.5rem"
                  >
                    Payment method
                  </Text>
                  <Text color="textLight">{order.payment.method}</Text>
                </Box>
              </Box>
              <Box
                bg="black"
                color="white"
                borderRadius="0.5rem"
                flex={{ md: '1 1 45%' }}
                px={{ base: '1.5rem', md: '2rem' }}
                py={{ base: '1.5rem', md: '2rem' }}
              >
                <Text
                  fontWeight="bold"
                  fontSize="0.875rem"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  mb="1rem"
                  color="textLight"
                >
                  Order summary
                </Text>
                <Stack spacing="0.75rem">
                  {totals.map(total => (
                    <SummaryLine
                      key={total.name}
                      name={total.name}
                      amount={total.amount}
                      grandTotal={total.grandTotal}
                    />
                  ))}
                </Stack>
                <Box mt="1.5rem">
                  <Text color="textLight" fontSize="0.75rem">
                    Status: <strong>{order.status}</strong>
                  </Text>
                  <Text color="textLight" fontSize="0.75rem">
                    Placed on:{' '}
                    {new Date(order.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </Text>
                </Box>
              </Box>
            </Flex>
            <Flex
              justify="space-between"
              align={{ base: 'stretch', md: 'center' }}
            >
              <Box>
                <Text color="textLight">
                  Need help? Reach us at{' '}
                  <a href="mailto:support@audiophile.shop">
                    support@audiophile.shop
                  </a>
                  .
                </Text>
              </Box>
              <Link href="/" passHref>
                <Button as="a" mt={{ base: '1.5rem', md: 0 }}>
                  Back to home
                </Button>
              </Link>
            </Flex>
          </Stack>
        ) : (
          <Stack spacing="1.5rem">
            <Heading as="h1" fontSize="2rem">
              Order unavailable
            </Heading>
            <Text color="textLight">
              We couldn’t find the order you were looking for. It may have
              expired or was already completed. Check your email for
              confirmation or contact support.
            </Text>
            <Link href="/" passHref>
              <Button as="a" alignSelf="flex-start">
                Back to home
              </Button>
            </Link>
          </Stack>
        )}
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  OrderConfirmationProps
> = async ({ query }) => {
  const { orderId } = query

  if (!orderId || Array.isArray(orderId)) {
    return {
      props: {
        order: null,
        orderId: orderId ? orderId[0] : null,
      },
    }
  }

  try {
    const order = await getOrderFromConvex(orderId)
    const serializableOrder = order
      ? (JSON.parse(JSON.stringify(order)) as StoredOrder)
      : null
    return {
      props: {
        order: serializableOrder,
        orderId,
      },
    }
  } catch (error) {
    console.error('Failed to fetch order during SSR', error)
    return {
      props: {
        order: null,
        orderId,
      },
    }
  }
}

export default OrderConfirmationPage

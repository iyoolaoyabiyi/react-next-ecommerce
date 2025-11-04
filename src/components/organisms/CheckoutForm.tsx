import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  useRadioGroup,
  Image,
  HStack,
  Stack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'

import FormLegend from 'components/atoms/FormLegend'
import FormField from 'components/molecules/FormField'
import Radio from 'components/atoms/Radio'
import Summary from 'components/molecules/Summary'
import { SHIPPING_FEE } from 'constants/fees'
import { cartItems, clearCart } from 'store/CartSlice'
import useCartTotals from 'hooks/useCartTotals'
import type { OrderPayload } from 'models/Order'

type Inputs = {
  name: string
  emailAddress: string
  phoneNumber: string
  address: string
  ZIPCode: string
  city: string
  country: string
  eMoneyNumber?: string
  eMoneyPin?: string
}

const paymentOptions = ['e-Money', 'Cash on Delivery'] as const
type PaymentMethod = (typeof paymentOptions)[number]

const CheckoutForm = (): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ mode: 'onBlur', shouldUnregister: true })

  const router = useRouter()
  const dispatch = useDispatch()
  const items = useSelector(cartItems)
  const { cartTotal, tax, grandTotal } = useCartTotals()

  const [checkedOption, setCheckedOption] = useState<PaymentMethod>(
    paymentOptions[0]
  )
  const [isDisabled, setIsDisabled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'Payment Details',
    defaultValue: paymentOptions[0],
    onChange: (value: string) => setCheckedOption(value as PaymentMethod),
  })

  const onSubmit: SubmitHandler<Inputs> = async formData => {
    if (isDisabled || isSubmitting) return

    if (!items.length) {
      setSubmitError(
        'Your cart is empty. Please add products before checking out.'
      )
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const orderPayload: OrderPayload = {
        customer: {
          name: formData.name,
          emailAddress: formData.emailAddress,
          phoneNumber: formData.phoneNumber,
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          country: formData.country,
          zipCode: formData.ZIPCode,
        },
        payment: {
          method: checkedOption,
          eMoneyNumber:
            checkedOption === 'e-Money'
              ? formData.eMoneyNumber?.trim()
              : undefined,
          eMoneyPin:
            checkedOption === 'e-Money'
              ? formData.eMoneyPin?.trim()
              : undefined,
        },
        items,
        totals: {
          subtotal: cartTotal,
          shipping: SHIPPING_FEE,
          tax,
          grandTotal,
        },
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.message || 'Unable to complete checkout.')
      }

      dispatch(clearCart())

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'audiophile:lastOrder',
          JSON.stringify({
            ...orderPayload,
            orderId: result.orderId,
            orderNumber: result.orderNumber,
            createdAt: result.createdAt,
            status: 'received',
          })
        )
      }

      await router.push({
        pathname: '/order-confirmation',
        query: { orderId: result.orderId },
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected error occurred during checkout.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const group = getRootProps()

  return (
    <Stack
      as="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      direction={{ base: 'column', lg: 'row' }}
      alignItems={{ lg: 'start' }}
      spacing={{ base: '2rem' }}
      mt={{ base: '1.5rem' }}
    >
      <Box
        bg="white"
        borderRadius="0.5rem"
        px={{ base: '1.5rem', sm: '1.75rem', lg: '3rem' }}
        pt={{ base: '1.5rem', sm: '1.875rem', lg: '3.625rem' }}
        pb={{ base: '2rem', lg: '3rem' }}
        maxWidth={{ lg: '45.625rem' }}
        flex={{ lg: '1 1 65%' }}
      >
        <Heading as="h1" fontSize={{ base: '1.75rem' }} mb={{ base: '2rem' }}>
          Checkout
        </Heading>
        <Box as="fieldset" mb="2rem">
          <FormLegend>Billing Details</FormLegend>
          <SimpleGrid
            gridTemplateColumns={{ base: '1fr', sm: '1fr 1fr' }}
            gridGap={{ base: '1rem' }}
          >
            <FormField
              {...register('name', {
                required: 'Field cannot be empty',
                pattern: {
                  value: /^[^<>%$#^*]*$/,
                  message: 'Wrong format',
                },
              })}
              aria-invalid={errors.name ? 'true' : 'false'}
              errors={errors.name}
              label="Name"
              placeholder="Salt Tester"
            />
            <FormField
              {...register('emailAddress', {
                required: 'Field cannot be empty',
                pattern: {
                  value: /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/,
                  message: 'Wrong format',
                },
              })}
              aria-invalid={errors.emailAddress ? 'true' : 'false'}
              errors={errors.emailAddress}
              label="Email Address"
              type="email"
              placeholder="iyo@mail.com"
            />
            <FormField
              {...register('phoneNumber', {
                required: 'Field cannot be empty',
              })}
              aria-invalid={errors.phoneNumber ? 'true' : 'false'}
              errors={errors.phoneNumber}
              label="Phone Number"
              placeholder="+1 202-555-0136"
            />
          </SimpleGrid>
        </Box>
        <Box as="fieldset" mb="2rem">
          <FormLegend>Shipping Info</FormLegend>
          <SimpleGrid
            gridTemplateColumns={{ base: '1fr', sm: '1fr 1fr' }}
            gridTemplateAreas={{ sm: '"a a" "b c" "d ."' }}
            gridGap={{ base: '1em', sm: '1rem' }}
          >
            <FormField
              {...register('address', {
                required: 'Field cannot be empty',
              })}
              aria-invalid={errors.address ? 'true' : 'false'}
              errors={errors.address}
              gridArea={{ sm: 'a' }}
              label="Your Address"
              placeholder="1137 Williams Avenue"
            />
            <FormField
              {...register('ZIPCode', {
                required: 'Field cannot be empty',
                pattern: {
                  value: /^[0-9]{5}(?:-[0-9]{4})?$/,
                  message: 'Wrong format',
                },
              })}
              aria-invalid={errors.ZIPCode ? 'true' : 'false'}
              errors={errors.ZIPCode}
              label="ZIP Code"
              type="text"
              placeholder="10001"
              gridArea={{ sm: 'b' }}
            />
            <FormField
              {...register('city', {
                required: 'Field cannot be empty',
              })}
              aria-invalid={errors.city ? 'true' : 'false'}
              errors={errors.city}
              label="City"
              placeholder="New York"
              gridArea={{ sm: 'c' }}
            />
            <FormField
              {...register('country', {
                required: 'Field cannot be empty',
              })}
              aria-invalid={errors.country ? 'true' : 'false'}
              errors={errors.country}
              label="Country"
              placeholder="United States"
              gridArea={{ sm: 'd' }}
            />
          </SimpleGrid>
        </Box>
        <Box as="fieldset">
          <FormLegend>Payment Details</FormLegend>
          <SimpleGrid
            gridTemplateColumns={{ base: '1fr', sm: '1fr 1fr' }}
            gridGap={{ sm: '1rem' }}
          >
            <Text color="black" fontWeight="bold" fontSize="0.75rem" mb={2}>
              Payment Method
            </Text>
            <Box {...group}>
              {paymentOptions.map(option => {
                const radio = getRadioProps({ value: option })
                return (
                  <Radio key={option} {...radio}>
                    {option}
                  </Radio>
                )
              })}
            </Box>
          </SimpleGrid>
          {checkedOption === paymentOptions[0] ? (
            <SimpleGrid
              gridTemplateColumns={{ base: '1fr', sm: '1fr 1fr' }}
              gridGap={{ base: '1rem' }}
              mt={{ base: '1rem' }}
            >
              <FormField
                {...register('eMoneyNumber', {
                  required: 'Field cannot be empty',
                  pattern: {
                    value: /^[0-9]{9}$/,
                    message: 'Wrong format',
                  },
                })}
                aria-invalid={errors.eMoneyNumber ? 'true' : 'false'}
                errors={errors.eMoneyNumber}
                label="e-Money Number"
                placeholder="238521993"
                type="text"
                inputMode="numeric"
              />
              <FormField
                {...register('eMoneyPin', {
                  required: 'Field cannot be empty',
                  pattern: {
                    value: /^[0-9]{4}$/,
                    message: 'Wrong format',
                  },
                })}
                aria-invalid={errors.eMoneyPin ? 'true' : 'false'}
                errors={errors.eMoneyPin}
                label="e-Money PIN"
                placeholder="6891"
                type="text"
                inputMode="numeric"
              />
            </SimpleGrid>
          ) : (
            <HStack align="center" spacing="2rem" mt="1.5rem">
              <Image src="/images/checkout/icon-cash-on-delivery.svg" />
              <Text>
                The ‘Cash on Delivery’ option enables you to pay in cash when
                our delivery courier arrives at your residence. Just make sure
                your address is correct so that your order will not be
                cancelled.
              </Text>
            </HStack>
          )}
        </Box>
      </Box>
      <Summary
        isDisabled={isDisabled}
        isSubmitting={isSubmitting}
        submitError={submitError}
        setIsDisabled={setIsDisabled}
      />
    </Stack>
  )
}

export default CheckoutForm

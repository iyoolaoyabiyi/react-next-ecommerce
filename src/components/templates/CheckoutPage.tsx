import { Container } from '@chakra-ui/react'
import GoBackLink from 'components/atoms/GoBackLink'
import CheckoutForm from 'components/organisms/CheckoutForm'

const CheckoutPage = (): JSX.Element => {
  return (
    <Container maxW="container.lg" px={6} as="main" id="main">
      <GoBackLink />
      <CheckoutForm />
    </Container>
  )
}

export default CheckoutPage

import { Text, HStack } from '@chakra-ui/react'
import type { StackProps } from '@chakra-ui/react'

type SummaryLineProps = StackProps & {
  name: string
  amount: number
  grandTotal?: boolean
  labelColor?: string
  valueColor?: string
}

const SummaryLine: React.FC<SummaryLineProps> = (props): JSX.Element => {
  const {
    name,
    amount,
    grandTotal = false,
    labelColor,
    valueColor,
    ...other
  } = props

  const resolvedValueColor = valueColor ?? (grandTotal ? 'accent' : 'black')

  return (
    <HStack justify="space-between" {...other}>
      <Text as="dt" textTransform="uppercase" color={labelColor}>
        {name}
      </Text>
      <Text
        as="dd"
        textTransform="uppercase"
        fontWeight="bold"
        fontSize="1.125rem"
        color={resolvedValueColor}
      >
        $ {amount.toLocaleString('en-US')}
      </Text>
    </HStack>
  )
}

export default SummaryLine

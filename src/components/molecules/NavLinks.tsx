import { HStack, Box, Link as ChakraLink } from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { links } from 'utils/links'

const NavLinks = (): JSX.Element => {
  const { asPath } = useRouter()

  return (
    <Box as="nav" display={{ base: 'none', lg: 'block' }}>
      <HStack as="ul" display="flex" spacing={9} listStyleType="none">
        {links.map(link => {
          const isActive = asPath === link.url

          return (
            <Box as="li" key={link.id}>
              <ChakraLink
                as={Link}
                href={link.url}
                fontSize="sm"
                fontWeight="bold"
                letterSpacing="0.125em"
                textTransform="uppercase"
                _hover={{ color: 'accent' }}
                transition="color 0.2s linear"
                color={isActive ? 'accent' : 'white'}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.text}
              </ChakraLink>
            </Box>
          )
        })}
      </HStack>
    </Box>
  )
}

export default NavLinks

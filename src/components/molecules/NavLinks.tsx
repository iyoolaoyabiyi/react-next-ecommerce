import { HStack, Box, Link as ChakraLink } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { links } from 'utils/links'

const isActivePath = (path: string, target: string): boolean => {
  if (target === '/') return path === '/'
  if (!path.startsWith(target)) return false
  if (path.length === target.length) return true
  return path.charAt(target.length) === '/'
}

const NavLinks = (): JSX.Element => {
  const { asPath } = useRouter()

  return (
    <Box as="nav" display={{ base: 'none', lg: 'block' }}>
      <HStack as="ul" display="flex" spacing={9} listStyleType="none">
        {links.map(link => {
          const { id, text, url } = link
          const isActive = isActivePath(asPath, url)

          return (
            <Box as="li" key={id}>
              <NextLink href={url} passHref>
                <ChakraLink
                  fontSize="sm"
                  fontWeight="bold"
                  letterSpacing="0.125em"
                  textTransform="uppercase"
                  _hover={{ color: 'accent' }}
                  transition="color 0.2s linear"
                  color={isActive ? 'accent' : 'whiteAlpha.900'}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {text}
                </ChakraLink>
              </NextLink>
            </Box>
          )
        })}
      </HStack>
    </Box>
  )
}

export default NavLinks

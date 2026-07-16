import type { InfiniteData } from '@tanstack/react-query'
import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'

import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const getFallbackName = (name = '') => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .trim()
}

export function flattenInfiniteData<T>(
  data?:
    | InfiniteData<{
        items: T[]
      }>
    | undefined,
  convert?: (item: T) => any,
): T[] {
  if (!data) return []
  return data.pages
    .flatMap((page) => page.items)
    .map(convert ?? ((item) => item))
}

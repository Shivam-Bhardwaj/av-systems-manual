'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Languages } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitcher() {
  const pathname = usePathname()
  
  const getLanguagePath = (locale: string) => {
    if (!pathname) return `/${locale}`
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) {
      return `/${locale}`
    }
    // Replace the first segment (language) with the new locale
    segments[0] = locale
    return `/${segments.join('/')}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={getLanguagePath('en')}>English</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={getLanguagePath('hi')}>Hindi</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

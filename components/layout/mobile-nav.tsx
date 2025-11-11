'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from './navigation'
import { LanguageSwitcher } from './language-switcher'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  // Close menu when pathname changes (navigation occurred)
  useEffect(() => {
    closeMenu()
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 h-11 w-11"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 border-r bg-background z-40 transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-6 pt-16">
            <h1 className="text-xl font-bold">AV Systems Manual</h1>
            <p className="text-sm text-muted-foreground mt-1">Engineering Reference</p>
          </div>
          <div className="flex-1 px-3 py-2 overflow-y-auto">
            <Navigation />
          </div>
          <div className="p-4 border-t flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Version 1.0.0 | © 2024
            </p>
            <LanguageSwitcher />
          </div>
        </div>
      </aside>
    </>
  )
}


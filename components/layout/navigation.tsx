'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Calculator, 
  FileText, 
  BookOpen, 
  LayoutDashboard,
  Volume2,
  Clock,
  Wifi,
  Monitor,
  Settings
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    name: 'Calculators',
    href: '/calculator',
    icon: Calculator,
    children: [
      { name: 'Room Acoustics (RT60)', href: '/calculator/room-acoustics', icon: Volume2 },
      { name: 'SPL Calculator', href: '/calculator/spl', icon: Volume2 },
      { name: 'Delay Calculator', href: '/calculator/delay', icon: Clock },
      { name: 'Cable Loss', href: '/calculator/cable-loss', icon: Wifi },
      { name: 'Video Calculator', href: '/calculator/video', icon: Monitor }
    ]
  },
  {
    name: 'Specification Generator',
    href: '/specification/generator',
    icon: FileText
  },
  {
    name: 'Reference',
    href: '/reference',
    icon: BookOpen,
    children: [
      { name: 'Theory & Principles', href: '/reference/theory' },
      { name: 'Installation Guide', href: '/reference/installation' }
    ]
  }
]

export function Navigation() {
  const pathname = usePathname()
  const params = useParams()
  const lang = params.lang

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || 
          (item.children && item.children.some(child => pathname === child.href))

        return (
          <div key={item.name}>
            <Link
              href={`/${lang}${item.href}`}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
            
            {item.children && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={`/${lang}${child.href}`}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm rounded-md transition-colors',
                      pathname === child.href
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    {'icon' in child && child.icon && <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />}
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

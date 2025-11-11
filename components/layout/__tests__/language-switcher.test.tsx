import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { usePathname } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders language switcher button', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/en')
    render(<LanguageSwitcher />)
    
    const button = screen.getByRole('button', { name: /change language/i })
    expect(button).toBeInTheDocument()
  })

  it('generates correct English path', async () => {
    const user = userEvent.setup()
    ;(usePathname as jest.Mock).mockReturnValue('/hi/calculator')
    render(<LanguageSwitcher />)
    
    const button = screen.getByRole('button', { name: /change language/i })
    await user.click(button)
    
    const englishLink = screen.getByRole('link', { name: /english/i })
    expect(englishLink).toHaveAttribute('href', '/en/calculator')
  })

  it('generates correct Hindi path', async () => {
    const user = userEvent.setup()
    ;(usePathname as jest.Mock).mockReturnValue('/en/calculator')
    render(<LanguageSwitcher />)
    
    const button = screen.getByRole('button', { name: /change language/i })
    await user.click(button)
    
    const hindiLink = screen.getByRole('link', { name: /hindi/i })
    expect(hindiLink).toHaveAttribute('href', '/hi/calculator')
  })

  it('handles root path correctly', async () => {
    const user = userEvent.setup()
    ;(usePathname as jest.Mock).mockReturnValue('/en')
    render(<LanguageSwitcher />)
    
    const button = screen.getByRole('button', { name: /change language/i })
    await user.click(button)
    
    const hindiLink = screen.getByRole('link', { name: /hindi/i })
    expect(hindiLink).toHaveAttribute('href', '/hi')
  })

  it('handles null pathname', async () => {
    const user = userEvent.setup()
    ;(usePathname as jest.Mock).mockReturnValue(null)
    render(<LanguageSwitcher />)
    
    const button = screen.getByRole('button', { name: /change language/i })
    await user.click(button)
    
    const englishLink = screen.getByRole('link', { name: /english/i })
    expect(englishLink).toHaveAttribute('href', '/')
  })
})


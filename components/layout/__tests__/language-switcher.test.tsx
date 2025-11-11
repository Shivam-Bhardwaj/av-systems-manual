import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { usePathname } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
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
    
    const englishText = screen.getByText('English')
    const englishLink = englishText.closest('a')
    expect(englishLink).toBeInTheDocument()
    expect(englishLink).toHaveAttribute('href', '/en/calculator')
  })

  it('generates correct Hindi path', async () => {
    const user = userEvent.setup()
    ;(usePathname as jest.Mock).mockReturnValue('/en/calculator')
    render(<LanguageSwitcher />)
    
    const button = screen.getByRole('button', { name: /change language/i })
    await user.click(button)
    
    const hindiText = screen.getByText('Hindi')
    const hindiLink = hindiText.closest('a')
    expect(hindiLink).toBeInTheDocument()
    expect(hindiLink).toHaveAttribute('href', '/hi/calculator')
  })

  it('handles root path correctly', async () => {
    const user = userEvent.setup()
    ;(usePathname as jest.Mock).mockReturnValue('/en')
    render(<LanguageSwitcher />)
    
    const button = screen.getByRole('button', { name: /change language/i })
    await user.click(button)
    
    const hindiText = screen.getByText('Hindi')
    const hindiLink = hindiText.closest('a')
    expect(hindiLink).toBeInTheDocument()
    expect(hindiLink).toHaveAttribute('href', '/hi')
  })

  it('handles null pathname', async () => {
    const user = userEvent.setup()
    ;(usePathname as jest.Mock).mockReturnValue(null)
    render(<LanguageSwitcher />)
    
    const button = screen.getByRole('button', { name: /change language/i })
    await user.click(button)
    
    const englishText = screen.getByText('English')
    const englishLink = englishText.closest('a')
    expect(englishLink).toBeInTheDocument()
    expect(englishLink).toHaveAttribute('href', '/en')
  })
})


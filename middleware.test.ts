import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: jest.fn((url) => ({ url })),
  },
}))

describe('middleware', () => {
  let mockRequest: Partial<NextRequest>

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = {
      nextUrl: {
        pathname: '/',
      },
      headers: {
        get: jest.fn(),
      },
    } as any
  })

  it('redirects to English when no locale in path', () => {
    ;(mockRequest.headers.get as jest.Mock).mockReturnValue('en')
    mockRequest.nextUrl!.pathname = '/calculator'
    
    const result = middleware(mockRequest as NextRequest)
    
    expect(mockRequest.nextUrl!.pathname).toBe('/en/calculator')
    expect(NextResponse.redirect).toHaveBeenCalled()
  })

  it('redirects to Hindi when Hindi is preferred', () => {
    ;(mockRequest.headers.get as jest.Mock).mockReturnValue('hi')
    mockRequest.nextUrl!.pathname = '/calculator'
    
    const result = middleware(mockRequest as NextRequest)
    
    expect(mockRequest.nextUrl!.pathname).toBe('/hi/calculator')
    expect(NextResponse.redirect).toHaveBeenCalled()
  })

  it('does not redirect when locale is already in path', () => {
    mockRequest.nextUrl!.pathname = '/en/calculator'
    
    const result = middleware(mockRequest as NextRequest)
    
    expect(result).toBeUndefined()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it('does not redirect when Hindi locale is already in path', () => {
    mockRequest.nextUrl!.pathname = '/hi/calculator'
    
    const result = middleware(mockRequest as NextRequest)
    
    expect(result).toBeUndefined()
    expect(NextResponse.redirect).not.toHaveBeenCalled()
  })

  it('defaults to English when unsupported language is preferred', () => {
    ;(mockRequest.headers.get as jest.Mock).mockReturnValue('fr')
    mockRequest.nextUrl!.pathname = '/calculator'
    
    const result = middleware(mockRequest as NextRequest)
    
    expect(mockRequest.nextUrl!.pathname).toBe('/en/calculator')
    expect(NextResponse.redirect).toHaveBeenCalled()
  })

  it('handles root path correctly', () => {
    ;(mockRequest.headers.get as jest.Mock).mockReturnValue('en')
    mockRequest.nextUrl!.pathname = '/'
    
    const result = middleware(mockRequest as NextRequest)
    
    expect(mockRequest.nextUrl!.pathname).toBe('/en/')
    expect(NextResponse.redirect).toHaveBeenCalled()
  })
})


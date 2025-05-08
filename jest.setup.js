// jest.setup.js
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Mock the window.matchMedia function which Next.js themes uses
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock the IntersectionObserver which is used by some UI components
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  disconnect() {
    return null
  }
  observe() {
    return null
  }
  takeRecords() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver which is used by some UI components
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }
  disconnect() {
    return null
  }
  observe() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock Supabase
jest.mock('@/lib/supabase-client', () => ({
  supabaseClient: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
          order: jest.fn(() => ({ data: [], error: null })),
        })),
        order: jest.fn(() => ({ data: [], error: null })),
      })),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
      update: jest.fn().mockResolvedValue({ data: [], error: null }),
      delete: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({ subscribe: jest.fn() })),
      unsubscribe: jest.fn(),
    })),
  },
}))

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn().mockImplementation(({ queryFn }) => ({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn().mockResolvedValue({}),
    isLoading: false,
    error: null,
  })),
}))

// Add TextEncoder and TextDecoder which are required by some libraries but not available in jsdom
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder 
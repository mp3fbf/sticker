/**
 * @description
 * Jest setup file to configure the testing environment for WhatsApp Sticker Maker.
 * Extends Jest's expect with DOM matchers from @testing-library/jest-dom.
 * Mocks browser APIs required for video processing that aren't available in the testing environment.
 *
 * @dependencies
 * - @testing-library/jest-dom: Provides custom DOM matchers for assertions
 */

// Import @testing-library/jest-dom to extend Jest matchers
import "@testing-library/jest-dom"

// Mock the window.URL.createObjectURL function used for creating blob URLs from processed videos
window.URL.createObjectURL = jest.fn(() => "blob:test-url")
window.URL.revokeObjectURL = jest.fn()

// Mock browser APIs that aren't available in the Jest environment
global.structuredClone = jest.fn(obj => JSON.parse(JSON.stringify(obj)))

// Mock HTMLMediaElement prototype properties that aren't implemented in jsdom
// These are required for video element interactions during testing
Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
  configurable: true,
  writable: true,
  value: jest.fn()
})

Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
  configurable: true,
  writable: true,
  value: jest.fn()
})

Object.defineProperty(window.HTMLMediaElement.prototype, "load", {
  configurable: true,
  writable: true,
  value: jest.fn()
})

// Mock ResizeObserver which is not included in jsdom but may be used by UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))

// Mock SharedArrayBuffer which is used by FFMPEG WASM for video processing
global.SharedArrayBuffer = class MockSharedArrayBuffer extends ArrayBuffer {}
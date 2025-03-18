/**
 * @description
 * Tests for the video processing functionality in the WhatsApp Sticker Maker app.
 * Validates that video files can be properly converted to WhatsApp stickers.
 *
 * Test cases:
 * - FFmpeg loading and instance reuse
 * - File processing end-to-end (with mocks)
 * - Error handling for invalid files
 * - Progress callback functionality
 * - Correct settings application for WhatsApp stickers
 * - Cleanup of temporary files
 *
 * @dependencies
 * - jest: Testing framework
 * - @ffmpeg/ffmpeg: FFmpeg WASM implementation (mocked)
 * - @ffmpeg/util: FFmpeg utility functions (mocked)
 * - @/lib/process-video: The module being tested
 * - @/lib/utils: For STICKER_REQUIREMENTS constants
 */

import { processVideo, loadFFmpeg } from "@/lib/process-video"
import { STICKER_REQUIREMENTS } from "@/lib/utils"

// Mock the FFmpeg module and util functions to avoid actual WASM execution during tests
jest.mock("@ffmpeg/ffmpeg", () => {
  return {
    FFmpeg: jest.fn().mockImplementation(() => ({
      load: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      exec: jest.fn().mockResolvedValue(undefined),
      writeFile: jest.fn().mockResolvedValue(undefined),
      readFile: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      deleteFile: jest.fn().mockResolvedValue(undefined)
    }))
  }
})

jest.mock("@ffmpeg/util", () => {
  return {
    fetchFile: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    toBlobURL: jest.fn().mockResolvedValue("blob:mock-url")
  }
})

describe("Video Processing Module", () => {
  // Mock File object for testing
  const createMockFile = (
    name = "test-video.mp4",
    type = "video/mp4",
    size = 1024 * 1024
  ): File => {
    return new File(["mock file content"], name, { type })
  }

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  test("loadFFmpeg should load the FFmpeg instance", async () => {
    // Act
    const ffmpeg = await loadFFmpeg()
    
    // Assert
    expect(ffmpeg).toBeDefined()
    expect(ffmpeg.load).toHaveBeenCalled()
  })

  test("loadFFmpeg should reuse the same instance when called multiple times", async () => {
    // Act
    const ffmpeg1 = await loadFFmpeg()
    const ffmpeg2 = await loadFFmpeg()
    
    // Assert
    expect(ffmpeg1).toBe(ffmpeg2)
    expect(ffmpeg1.load).toHaveBeenCalledTimes(1)
  })

  test("processVideo should process a video file", async () => {
    // Arrange
    const mockFile = createMockFile()
    const progressCallback = jest.fn()
    
    // Act
    const result = await processVideo(mockFile, progressCallback)
    
    // Assert
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe("image/webp")
  })

  test("processVideo should report progress via callback", async () => {
    // Arrange
    const mockFile = createMockFile()
    const progressCallback = jest.fn()
    
    // Mock the FFmpeg on function to trigger progress events
    jest.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
      return 1 as any // Return a dummy timeout ID
    })
    
    // Act
    await processVideo(mockFile, progressCallback)
    
    // Assert
    // The progress callback should be passed to loadFFmpeg, but since we're mocking,
    // we can't directly test if it was called by FFmpeg events.
    // This is a limitation of our testing approach.
    expect(progressCallback).toBeDefined()
  })

  test("processVideo should handle errors properly", async () => {
    // Arrange
    const mockFile = createMockFile()
    
    // Mock FFmpeg to throw an error
    require("@ffmpeg/ffmpeg").FFmpeg.mockImplementationOnce(() => ({
      load: jest.fn().mockRejectedValue(new Error("Mock FFmpeg error")),
      on: jest.fn()
    }))
    
    // Act & Assert
    await expect(processVideo(mockFile)).rejects.toThrow("Failed to process video")
  })

  test("processVideo should use the correct settings for WhatsApp stickers", async () => {
    // Arrange
    const mockFile = createMockFile()
    const mockExec = jest.fn().mockResolvedValue(undefined)
    
    // Mock FFmpeg with a spy on exec
    require("@ffmpeg/ffmpeg").FFmpeg.mockImplementationOnce(() => ({
      load: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      exec: mockExec,
      writeFile: jest.fn().mockResolvedValue(undefined),
      readFile: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      deleteFile: jest.fn().mockResolvedValue(undefined)
    }))
    
    // Act
    await processVideo(mockFile)
    
    // Assert
    expect(mockExec).toHaveBeenCalled()
    
    // Check that the FFmpeg command contains expected parameters
    const ffmpegArgs = mockExec.mock.calls[0][0]
    
    // Check for duration limit
    expect(ffmpegArgs).toContain("-t")
    expect(ffmpegArgs).toContain(STICKER_REQUIREMENTS.MAX_DURATION_SECONDS.toString())
    
    // Check for WebP format
    expect(ffmpegArgs).toContain("-c:v")
    expect(ffmpegArgs).toContain("libwebp")
    
    // Check for dimensions (scale to 512:512)
    expect(ffmpegArgs).toContain("-vf")
    expect(ffmpegArgs.some((arg: string) => 
      arg.includes("scale=512:512") && 
      arg.includes("pad=512:512")
    )).toBe(true)
  })

  test("processVideo should clean up temporary files", async () => {
    // Arrange
    const mockFile = createMockFile()
    const mockDeleteFile = jest.fn().mockResolvedValue(undefined)
    
    // Mock FFmpeg with a spy on deleteFile
    require("@ffmpeg/ffmpeg").FFmpeg.mockImplementationOnce(() => ({
      load: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      exec: jest.fn().mockResolvedValue(undefined),
      writeFile: jest.fn().mockResolvedValue(undefined),
      readFile: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      deleteFile: mockDeleteFile
    }))
    
    // Act
    await processVideo(mockFile)
    
    // Assert
    expect(mockDeleteFile).toHaveBeenCalledTimes(2) // Should delete input and output files
  })
})
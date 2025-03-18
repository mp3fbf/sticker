/**
 * @description
 * Tests for the file validation functionality in the WhatsApp Sticker Maker app.
 * Validates that files are properly checked against WhatsApp's sticker requirements.
 *
 * Test cases:
 * - File type validation (supported vs. unsupported formats)
 * - File size validation (within and exceeding size limits)
 * - Video duration validation (within and exceeding duration limits)
 * - Comprehensive validation (multiple validation criteria)
 * - Handling of null/undefined files
 *
 * @dependencies
 * - jest: Testing framework
 * - @/lib/validators: The module being tested
 * - @/lib/utils: For constants like STICKER_REQUIREMENTS
 */

import {
    validateFileType,
    validateFileSize,
    validateVideoDuration,
    validateVideoFile
  } from "@/lib/validators"
  import { STICKER_REQUIREMENTS } from "@/lib/utils"
  
  describe("File Validation Module", () => {
    // Mock File object for testing
    const createMockFile = (
      name = "test-video.mp4",
      type = "video/mp4",
      size = 1024 * 1024 // 1MB
    ): File => {
      return new File(["mock file content"], name, { type })
    }
  
    beforeEach(() => {
      // Reset any mocks
      jest.clearAllMocks()
    })
  
    describe("validateFileType", () => {
      test("should validate supported video file types", () => {
        // Test all supported formats from STICKER_REQUIREMENTS
        for (const format of STICKER_REQUIREMENTS.SUPPORTED_INPUT_FORMATS) {
          const mockFile = createMockFile("test-video.mp4", format)
          const result = validateFileType(mockFile)
          expect(result.isValid).toBe(true)
          expect(result.errorMessage).toBeUndefined()
        }
      })
  
      test("should reject unsupported file types", () => {
        const unsupportedTypes = [
          "image/jpeg",
          "image/png",
          "video/avi",
          "application/pdf"
        ]
  
        for (const type of unsupportedTypes) {
          const mockFile = createMockFile("test-file.jpg", type)
          const result = validateFileType(mockFile)
          expect(result.isValid).toBe(false)
          expect(result.errorMessage).toBeDefined()
          expect(result.errorMessage).toContain("Unsupported file format")
        }
      })
  
      test("should handle null or undefined file", () => {
        const result = validateFileType(null as any)
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe("No file selected")
      })
    })
  
    describe("validateFileSize", () => {
      test("should validate files within size limits", () => {
        // Create a file with size below the limit
        const maxSizeBytes = STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB.DESKTOP * 1024 * 1024
        const mockFile = createMockFile("test-video.mp4", "video/mp4", maxSizeBytes - 1024)
        
        const result = validateFileSize(mockFile)
        expect(result.isValid).toBe(true)
        expect(result.errorMessage).toBeUndefined()
      })
  
      test("should reject files exceeding size limits", () => {
        // Create a file with size above the limit
        const maxSizeBytes = STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB.DESKTOP * 1024 * 1024
        const mockFile = createMockFile("test-video.mp4", "video/mp4", maxSizeBytes + 1024)
        
        const result = validateFileSize(mockFile)
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBeDefined()
        expect(result.errorMessage).toContain("File too large")
      })
  
      test("should handle null or undefined file", () => {
        const result = validateFileSize(null as any)
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe("No file selected")
      })
    })
  
    describe("validateVideoDuration", () => {
      beforeEach(() => {
        // Mock createElement and URL.createObjectURL/revokeObjectURL
        document.createElement = jest.fn().mockImplementation((tagName) => {
          if (tagName === "video") {
            return {
              load: jest.fn(),
              onloadedmetadata: null,
              onerror: null,
              src: "",
              duration: 2 // Default duration in seconds
            }
          }
          return {}
        })
        
        URL.createObjectURL = jest.fn().mockReturnValue("blob:mock-url")
        URL.revokeObjectURL = jest.fn()
      })
  
      test("should validate videos within duration limits", async () => {
        // Arrange
        const mockFile = createMockFile()
        const mockVideo = document.createElement("video") as any
        mockVideo.duration = STICKER_REQUIREMENTS.MAX_DURATION_SECONDS - 1
        
        // Simulate the onloadedmetadata event
        setTimeout(() => {
          mockVideo.onloadedmetadata && mockVideo.onloadedmetadata()
        }, 0)
        
        // Act
        const result = await validateVideoDuration(mockFile)
        
        // Assert
        expect(result.isValid).toBe(true)
        expect(result.errorMessage).toBeUndefined()
        expect(URL.revokeObjectURL).toHaveBeenCalled()
      })
  
      test("should reject videos exceeding duration limits", async () => {
        // Arrange
        const mockFile = createMockFile()
        const mockVideo = document.createElement("video") as any
        mockVideo.duration = STICKER_REQUIREMENTS.MAX_DURATION_SECONDS + 1
        
        // Simulate the onloadedmetadata event
        setTimeout(() => {
          mockVideo.onloadedmetadata && mockVideo.onloadedmetadata()
        }, 0)
        
        // Act
        const result = await validateVideoDuration(mockFile)
        
        // Assert
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBeDefined()
        expect(result.errorMessage).toContain("Video too long")
        expect(URL.revokeObjectURL).toHaveBeenCalled()
      })
  
      test("should handle errors in video loading", async () => {
        // Arrange
        const mockFile = createMockFile()
        const mockVideo = document.createElement("video") as any
        
        // Simulate an error event
        setTimeout(() => {
          mockVideo.onerror && mockVideo.onerror()
        }, 0)
        
        // Act
        const result = await validateVideoDuration(mockFile)
        
        // Assert
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBeDefined()
        expect(result.errorMessage).toContain("Failed to read video duration")
        expect(URL.revokeObjectURL).toHaveBeenCalled()
      })
  
      test("should handle non-video files", async () => {
        // Arrange
        const mockFile = createMockFile("test-file.jpg", "image/jpeg")
        
        // Act
        const result = await validateVideoDuration(mockFile)
        
        // Assert
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBe("Not a valid video file")
      })
    })
  
    describe("validateVideoFile", () => {
      test("should validate files meeting all requirements", async () => {
        // Arrange
        jest.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
          callback()
          return 1 as any // Return a dummy timeout ID
        })
        
        // Create a valid mock file
        const mockFile = createMockFile()
        
        // Mock video element for duration check
        const mockVideo = document.createElement("video") as any
        mockVideo.duration = STICKER_REQUIREMENTS.MAX_DURATION_SECONDS - 1
        
        // Act
        const result = await validateVideoFile(mockFile, { checkDuration: true })
        
        // Assert
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
  
      test("should reject files with multiple validation issues", async () => {
        // Arrange
        jest.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
          callback()
          return 1 as any // Return a dummy timeout ID
        })
        
        // Create an invalid mock file (wrong type and too big)
        const maxSizeBytes = STICKER_REQUIREMENTS.MAX_FILE_SIZE_MB.DESKTOP * 1024 * 1024
        const mockFile = createMockFile(
          "test-file.pdf", 
          "application/pdf", 
          maxSizeBytes + 1024
        )
        
        // Act
        const result = await validateVideoFile(mockFile)
        
        // Assert
        expect(result.isValid).toBe(false)
        expect(result.errors.length).toBeGreaterThanOrEqual(2)
        expect(result.errors.some(e => e.includes("Unsupported file format"))).toBe(true)
        expect(result.errors.some(e => e.includes("File too large"))).toBe(true)
      })
  
      test("should handle null or undefined file", async () => {
        // Act
        const result = await validateVideoFile(null as any)
        
        // Assert
        expect(result.isValid).toBe(false)
        expect(result.errors).toHaveLength(1)
        expect(result.errors[0]).toBe("No file selected")
      })
  
      test("should skip duration validation when not requested", async () => {
        // Arrange
        const mockFile = createMockFile()
        const validateVideoDurationSpy = jest.spyOn({ validateVideoDuration }, "validateVideoDuration")
        
        // Act
        await validateVideoFile(mockFile, { checkDuration: false })
        
        // Assert
        expect(validateVideoDurationSpy).not.toHaveBeenCalled()
      })
    })
  })
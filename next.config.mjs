/*
Configures Next.js for the app.
*/

/** @type {import('next').NextConfig} */
const nextConfig = { 
    images: { 
      remotePatterns: [{ hostname: "localhost" }] 
    },
    // These headers are crucial for SharedArrayBuffer support in browsers
    // Required for FFmpeg WASM to work properly
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cross-Origin-Embedder-Policy',
              value: 'require-corp',
            },
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin',
            },
          ],
        },
      ]
    },
  }
  
  export default nextConfig
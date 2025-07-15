/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.amazonaws.com", // Example: if you use S3 for images
        port: "",
        pathname: "/my-bucket/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net", // Allow images from jsdelivr if needed
        port: "",
        pathname: "/npm/**",
      },
    ],
    unoptimized: true,
    dangerouslyAllowSVG: true, // ADD THIS LINE
    contentDispositionType: "inline", // Recommended with dangerouslyAllowSVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // Recommended with dangerouslyAllowSVG
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live/ https://vercel.fides-cdn.ethyca.com/ https://cdn.jsdelivr.net;
              style-src 'self' 'unsafe-inline' https://vercel.live/ https://vercel.fides-cdn.ethyca.com/ https://fonts.googleapis.com/ https://cdn.jsdelivr.net;
              img-src 'self' blob: data: https://cdn.jsdelivr.net;
              font-src 'self' https://fonts.gstatic.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

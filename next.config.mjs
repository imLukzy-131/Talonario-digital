/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.3.234', '192.168.3.234:3000'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

export default nextConfig;
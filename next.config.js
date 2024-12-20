/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        serverActions: true
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Host',
                        value: 'intervenant-app.fredtrivett.com'
                    }
                ]
            }
        ]
    }
}

module.exports = nextConfig 
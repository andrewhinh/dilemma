/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'ap.rdcpix.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ap.rdcpix.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'nh.rdcpix.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'nh.rdcpix.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'ar.rdcpix.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ar.rdcpix.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'p.rdcpix.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'p.rdcpix.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
}

module.exports = nextConfig
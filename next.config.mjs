/** @type {import('next').NextConfig} */
const nextConfig = {
    // Aquí podemos agregar configuraciones de seguridad e imágenes
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
        ],
    },
};

export default nextConfig;

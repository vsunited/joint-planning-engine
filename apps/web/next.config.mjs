/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jpe/shared'],
  // Static export — Firebase Hosting serves the generated `out/` directory
  // (see firebase.json "hosting.public"). The app is fully client-side.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Set BASE_PATH=/repo-name when hosting on GitHub Pages under a project URL.
  basePath: process.env.BASE_PATH || '',
  env: { NEXT_PUBLIC_BASE_PATH: process.env.BASE_PATH || '' }
};
export default nextConfig;

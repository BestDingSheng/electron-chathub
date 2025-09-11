/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 启用静态导出，用于 Electron 打包
  output: 'export',
  // 设置基础路径，确保资源正确加载
  basePath: '',
  // 禁用图片优化
  distDir: 'out',
}

export default nextConfig

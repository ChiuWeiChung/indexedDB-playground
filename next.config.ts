import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public', // Output directory for service worker
  register: true, // Automatically register service worker
  skipWaiting: true, // Activate service worker immediately
  clientsClaim: true, // Claim clients immediately
  sw: 'service-worker.js',
  disable: process.env.NODE_ENV === 'development', // 若要關閉 PWA，則設為 true
  buildExcludes: [/middleware-manifest.json$/, /^((app-|^)build-manifest\.json|react-loadable-manifest\.json)$/], // 排除 middleware-manifest.json 和 build-manifest.json
});

export default withPWA({
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  reactStrictMode: false,
});

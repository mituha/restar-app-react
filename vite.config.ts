import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dts({
    tsconfigPath: './tsconfig.app.json',
    include: ['src'],
    insertTypesEntry: true,
    bundleTypes: true
  })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'restar-app',
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'react', 'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-markdown',
        'lucide-react',
        '@gitgraph/js',
        '@gitgraph/react'
      ],
      output: [
        {
          format: 'es',
          entryFileNames: 'index.js',
          preserveModules: false
        },
        {
          format: 'umd',
          name: 'restar-app',
          entryFileNames: 'index.umd.cjs',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
            'react/jsx-dev-runtime': 'jsxDevRuntime',
            'lucide-react': 'Lucide',
            '@gitgraph/js': 'gitgraphJs',
            '@gitgraph/react': 'gitgraphReact'
          }
        }
      ]
    },
    minify: true
  }
})

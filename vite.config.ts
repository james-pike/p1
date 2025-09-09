/**
 * Vite config for Qwik project
 * Handles server-only Node modules like @libsql/client
 */
import { defineConfig, type UserConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity, extendConfig } from '@builder.io/qwik-city/vite';
import { vercelEdgeAdapter } from '@builder.io/qwik-city/adapters/vercel-edge/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import pkg from './package.json';

type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};

errorOnDuplicatesPkgDeps(devDependencies, dependencies);

// Base configuration
const baseConfig = defineConfig({
  plugins: [qwikCity(), qwikVite(), tsconfigPaths({ root: '.' })],
  optimizeDeps: {
    exclude: ['@libsql/client'],
  },
  ssr: {
    external: ['@libsql/client'],
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=0',
    },
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=600',
    },
  },
});

// Extend for Vercel Edge
export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ['src/entry.vercel-edge.tsx', '@qwik-city-plan'],
      },
      outDir: '.vercel/output/functions/_qwik-city.func',
    },
    plugins: [vercelEdgeAdapter()],
  };
});

function errorOnDuplicatesPkgDeps(devDependencies: PkgDep, dependencies: PkgDep) {
  const duplicateDeps = Object.keys(devDependencies).filter(dep => dependencies[dep]);
  const qwikPkg = Object.keys(dependencies).filter(dep => /qwik/i.test(dep));
  if (qwikPkg.length > 0) {
    throw new Error(`Move qwik packages to devDependencies: ${qwikPkg.join(', ')}`);
  }
  if (duplicateDeps.length > 0) {
    throw new Error(`
      Duplicate dependencies detected: ${duplicateDeps.join(', ')}
      Move these to devDependencies only and remove from dependencies.
    `);
  }
}
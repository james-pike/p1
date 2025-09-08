/**
 * Vite config for Qwik project
 * Handles server-only Node modules like @libsql/client
 */
import { defineConfig, type UserConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import pkg from './package.json';

type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};

// Throw errors for duplicate dependencies
errorOnDuplicatesPkgDeps(devDependencies, dependencies);

export default defineConfig(({ command, mode }): UserConfig => {
  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths({ root: '.' })],

    optimizeDeps: {
      // Prevent dev pre-bundling for Node-only packages
      exclude: ['@libsql/client'],
    },

    ssr: {
      // Externalize Node-only packages so Rollup doesn't try to bundle them
      external: ['@libsql/client'],
    },

    server: {
      headers: {
        'Cache-Control': 'public, max-age=0', // dev: no cache
      },
    },

    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600', // preview: short cache
      },
    },
  };
});

// ---------------------
// Utils
// ---------------------
function errorOnDuplicatesPkgDeps(devDependencies: PkgDep, dependencies: PkgDep) {
  const duplicateDeps = Object.keys(devDependencies).filter(dep => dependencies[dep]);

  // Check for qwik packages in dependencies
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

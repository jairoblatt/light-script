import typescript from 'rollup-plugin-typescript2';
import ttypescript from 'ttypescript';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import analyze from 'rollup-plugin-analyzer';

const base = {
  input: 'src/index.ts',
  plugins: [
    analyze(),
    typescript({
      typescript: ttypescript,
      useTsconfigDeclarationDir: true,
      emitDeclarationOnly: true,
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts'],
      babelHelpers: 'bundled',
      presets: [['@babel/preset-env']],
    }),
  ],
};

export default [
  {
    input: base.input,
    output: {
      compact: true,
      file: 'dist/lightScript.min.js',
      format: 'iife',
      name: 'lightScript',
      exports: 'auto',
    },
    plugins: [
      ...base.plugins,
      terser({
        output: {
          ecma: 5,
        },
      }),
    ],
  },
  {
    ...base,
    output: {
      file: 'dist/lightScript.esm.js',
      format: 'esm',
      exports: 'named',
    },
  },
  {
    ...base,
    output: {
      compact: true,
      file: 'dist/lightScript.ssr.js',
      format: 'cjs',
      name: 'lightScript',
      exports: 'auto',
    },
  },
];

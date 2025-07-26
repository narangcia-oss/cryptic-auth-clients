// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

const input = 'src/index.ts';

export default [
  {
    input: input,
    output: [
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
    external: ['axios'],
  },
  {
    input: input,
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
  },
];

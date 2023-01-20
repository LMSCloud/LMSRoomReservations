import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import template from "rollup-plugin-html-literals";
// import analyze from 'rollup-plugin-analyzer';
// import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: './src/main.js',
    output: {
      dir: './Koha/Plugin/Com/LMSCloud/RoomReservations/js/',
      format: 'umd',
      name: 'RoomReservationBundle',
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      // template(),
      // terser(),
      // analyze(),
    ],
  },
];
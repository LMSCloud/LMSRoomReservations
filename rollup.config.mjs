import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [
  {
    input: './src/main.js',
    output: {
      dir: './Koha/Plugin/Com/LMSCloud/RoomReservations/js/',
      format: 'umd',
      name: 'RoomReservationBundle',
    },
    plugins: [
      nodeResolve(),
      commonjs(),
    ],
  },
];

import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import template from "rollup-plugin-html-literals";
// import analyze from 'rollup-plugin-analyzer';
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";

export default [
  {
    input: "./src/main.ts",
    output: {
      dir: "./Koha/Plugin/Com/LMSCloud/RoomReservations/js/",
      format: "umd",
      name: "RoomReservationBundle",
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
      }),
      nodeResolve(),
      commonjs(),
      template(),
      terser(),
      // analyze(),
    ],
  },
];

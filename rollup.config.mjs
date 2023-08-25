import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import minifyHTML from "rollup-plugin-html-literals";

export default {
  input: "./src/main.ts",
  output: {
    dir: "./Koha/Plugin/Com/LMSCloud/RoomReservations/dist/",
    format: "umd",
    name: "RoomReservationBundle",
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      declaration: false,
      declarationMap: false,
    }),
    minifyHTML(),
    terser(),
  ],
};

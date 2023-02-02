import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
// import template from "rollup-plugin-html-literals";
// import analyze from 'rollup-plugin-analyzer';
// import { terser } from 'rollup-plugin-terser';
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import path from "path";

export default [
  {
    input: "./src/main.js",
    output: {
      dir: "./Koha/Plugin/Com/LMSCloud/RoomReservations/js/",
      format: "umd",
      name: "RoomReservationBundle",
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      postcss({
        plugins: [
          autoprefixer({
            overrideBrowserslist: ["last 2 versions", "ie >= 11"],
          }),
        ],
        extract: path.resolve(
          "Koha/Plugin/Com/LMSCloud/RoomReservations/js/main.css"
        ),
        minimize: true,
        sourceMap: true,
      }),

      // template(),
      // terser(),
      // analyze(),
    ],
  },
];

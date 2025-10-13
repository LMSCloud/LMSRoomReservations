import { defineConfig } from "rolldown";
import typescript from "@rollup/plugin-typescript";
import minifyHTML from "rollup-plugin-html-literals";

export default defineConfig([
  // OPAC bundle - only public-facing components
  {
    input: "./src/opac.ts",
    output: {
      dir: "./Koha/Plugin/Com/LMSCloud/RoomReservations/dist/",
      entryFileNames: "opac.js",
      format: "esm",
      sourcemap: true,
      minify: true,
    },
    platform: "browser",
    resolve: {
      extensions: [".ts", ".js"],
    },
    plugins: [
      typescript({
        sourceMap: false,
        inlineSources: false,
      }),
      minifyHTML(),
    ],
  },
  // Staff bundle - admin interface components
  {
    input: "./src/staff.ts",
    output: {
      dir: "./Koha/Plugin/Com/LMSCloud/RoomReservations/dist/",
      entryFileNames: "staff.js",
      format: "esm",
      sourcemap: true,
      minify: true,
    },
    platform: "browser",
    resolve: {
      extensions: [".ts", ".js"],
    },
    plugins: [
      typescript({
        sourceMap: false,
        inlineSources: false,
      }),
      minifyHTML(),
    ],
  },
  // Legacy main bundle for backward compatibility
  {
    input: "./src/main.ts",
    output: {
      dir: "./Koha/Plugin/Com/LMSCloud/RoomReservations/dist/",
      entryFileNames: "main.js",
      format: "umd",
      name: "RoomReservationBundle",
      sourcemap: true,
      minify: true,
    },
    platform: "browser",
    resolve: {
      extensions: [".ts", ".js"],
    },
    plugins: [
      typescript({
        sourceMap: false,
        inlineSources: false,
      }),
      minifyHTML(),
    ],
  },
  // Patron bookings table
  {
    input: "./src/opac/PatronsBookingsTable.ts",
    output: {
      dir: "./Koha/Plugin/Com/LMSCloud/RoomReservations/dist/",
      format: "iife",
      name: "PatronsBookingsTable",
      sourcemap: true,
      minify: true,
    },
    platform: "browser",
    resolve: {
      extensions: [".ts", ".js"],
    },
    plugins: [
      typescript({
        sourceMap: false,
        inlineSources: false,
      }),
      minifyHTML(),
    ],
  },
]);

module.exports = {
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"],
  overrides: [
    {
      files: ["src/components/custom/LMSCalendar/**/*.ts"],
      options: {
        // Exclude formatting for files under LMSCalendar
        prettier: false,
      },
    },
    {
      files: ["src/**/*.ts"],
      options: {
        tabWidth: 4,
        printWidth: 120, // Set the desired line length to 120 characters
        // Other Prettier options for files not under LMSCalendar
      },
    },
  ],
};

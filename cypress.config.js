import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    viewportWidth: 390,
    viewportHeight: 844,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});

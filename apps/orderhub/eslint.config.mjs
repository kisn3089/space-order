import { nestJsConfig } from "@spaceorder/lintconfig/nestjs";

export default [
  ...nestJsConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
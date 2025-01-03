/**
 * Linter tool for linting using JSDoc
 *
 * Due to poor integration between ESLint and Deno, I was too lazy to make a custom lint rule for deno_lint.
 * Therefore, this file performs the custom lint of checking for TODOs, and runs all todo cases
 */

import { createParser, Parser } from "npm:@jsdoc/parse";

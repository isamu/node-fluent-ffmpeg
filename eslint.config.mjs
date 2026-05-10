import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import sonarjs from 'eslint-plugin-sonarjs';
import securityPlugin from 'eslint-plugin-security';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'examples/**', 'doc/**', 'tools/**'],
  },
  js.configs.recommended,
  sonarjs.configs.recommended,
  securityPlugin.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  // Test fixtures (CJS preset modules dynamically required by the args/processor tests).
  {
    files: ['test/assets/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.ts', '**/*.mts', 'test/**/*.ts'],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.es2021, ...globals.node },
      ecmaVersion: 'latest',
    },
    plugins: {
      prettier: prettierPlugin,
      import: importPlugin,
    },
    rules: {
      // ── TypeScript strictness ──────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      // Off: both lib and test have legitimate `!` sites (constructor-
      // bootstrap fields in lib, post-`assert.ok` reads in tests).
      // Mechanical removal would either change runtime error paths or
      // require type assertions that just trade one cast for another.
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/method-signature-style': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true,
          enums: true,
          typedefs: true,
          ignoreTypeReferences: true,
        },
      ],
      'no-use-before-define': 'error',

      // ── General JS rules ───────────────────────────────────────
      eqeqeq: ['error', 'smart'],
      'no-throw-literal': 'error',
      'no-implicit-coercion': [
        'error',
        { boolean: true, number: true, string: true, disallowTemplateShorthand: false },
      ],
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'no-else-return': ['error', { allowElseIf: false }],
      'default-case-last': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-multi-assign': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'no-self-compare': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-constructor-return': 'error',
      'array-callback-return': 'error',
      'default-param-last': 'error',
      'no-new-wrappers': 'error',
      'no-octal-escape': 'error',
      'no-proto': 'error',
      'no-script-url': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-rename': 'error',
      radix: 'error',
      'prefer-object-spread': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-lonely-if': 'error',
      'no-floating-decimal': 'error',
      'no-unused-private-class-members': 'error',
      'no-loop-func': 'error',
      'no-new': 'error',
      'no-undef-init': 'error',
      'no-useless-return': 'error',
      'prefer-regex-literals': 'error',
      'prefer-exponentiation-operator': 'error',
      'consistent-return': 'error',
      complexity: ['error', { max: 15 }],
      'max-depth': ['error', { max: 4 }],
      'max-params': ['error', { max: 6 }],
      'no-shadow': 'error',
      'no-param-reassign': 'error',
      'prefer-const': 'error',
      'no-return-assign': 'error',
      'object-shorthand': 'error',

      // ── Import plugin ─────────────────────────────────────────
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',

      // ── Prettier ──────────────────────────────────────────────
      'prettier/prettier': 'error',

      // ── SonarJS tuning ────────────────────────────────────────
      'sonarjs/cognitive-complexity': 'error',
      'sonarjs/no-ignored-exceptions': 'error',
      'sonarjs/no-commented-code': 'error',
      'sonarjs/no-nested-conditional': 'error',
      'sonarjs/no-nested-functions': 'error',
      'sonarjs/concise-regex': 'error',
      // Off: lib regexes are the legacy ffmpeg output parsers ported
      // verbatim (intentional behaviour-equivalence); the one test site
      // is a bounded `(\d+)x\?` match that cannot backtrack on real input.
      'sonarjs/slow-regex': 'off',
      'sonarjs/regex-complexity': 'error',
      'sonarjs/single-char-in-character-classes': 'error',
      'sonarjs/no-os-command-from-path': 'error',
      // @typescript-eslint/no-unused-vars already covers this with the
      // ^_ ignore pattern; sonarjs version has no options.
      'sonarjs/no-unused-vars': 'error',

      // ── Security plugin tuning ────────────────────────────────
      // Off: the only remaining lib site is `mkdir(folder)` in
      // recipes.ts where `folder` is the user-supplied screenshot
      // output directory — that's the API contract, not a tainted
      // input. Tests inherit `off` via the test override below.
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-child-process': 'error',
    },
  },
  // lib/ has documented-intentional violations on rules that are `error`
  // by default. Disable them for lib only — the rules stay strict for
  // test code (which has no remaining violations on these), so test
  // regressions fail CI while lib's historical exemptions stay quiet.
  //
  // Reasons (per rule):
  //   method-signature-style — EventEmitter overload typings in lib/types.ts
  //     rely on the method form; flipping to property form would erase
  //     overload merging.
  //   no-dynamic-delete — ffprobe.ts lifts legacy TAG:* / DISPOSITION:*
  //     keys into nested bags from external ffprobe output.
  //   unified-signatures — ffprobe(file, index, cb) and ffprobe(file,
  //     options, cb) are deliberately separate overloads.
  //   no-empty-function — a few harmless empty stubs in lib.
  //   no-multi-assign — option modules wire `proto.withFoo = proto.foo = ...`
  //     to keep the alias chain visible at the definition site.
  //   sonarjs/{concise,regex-complexity,single-char,...} — legacy ffmpeg
  //     output parsers ported verbatim with intentional behaviour-equivalence.
  //   sonarjs/no-nested-functions — library is callback-heavy by nature
  //     (ffmpeg child processes, event listeners, stream pipelines).
  //   sonarjs/no-nested-conditional — small parser ternaries in option
  //     modules; flattening reduces readability.
  //   sonarjs/no-os-command-from-path — spawning ffmpeg/ffprobe/flvmeta by
  //     name on PATH is the library's purpose, not a security risk.
  //   security/detect-object-injection — option modules index `proto[name]`
  //     by alias-table keys, not user input.
  {
    files: ['lib/**/*.ts'],
    rules: {
      '@typescript-eslint/method-signature-style': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      'no-multi-assign': 'off',
      'sonarjs/concise-regex': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/no-os-command-from-path': 'off',
      'sonarjs/regex-complexity': 'off',
      'sonarjs/single-char-in-character-classes': 'off',
      'security/detect-object-injection': 'off',
    },
  },
  prettierConfig,
];

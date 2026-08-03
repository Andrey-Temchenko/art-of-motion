import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import perfectionist from 'eslint-plugin-perfectionist';
import {defineConfig, globalIgnores} from 'eslint/config';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      perfectionist
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {prefer: 'type-imports', fixStyle: 'separate-type-imports'}
      ],
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          newlinesBetween: 1,
          groups: [
            ['type-react/next', 'react/next'],
            ['type-builtin', 'builtin'],
            ['type-external', 'external'],
            ['type-config', 'config'],
            ['type-constants', 'constants'],
            ['type-types', 'types'],
            ['type-lib', 'lib'],
            ['type-providers', 'providers'],
            ['type-repositories', 'repositories'],
            ['type-services', 'services'],
            ['type-actions', 'actions'],
            ['type-store', 'store'],
            ['type-hooks', 'hooks'],
            ['type-locales', 'locales'],
            ['type-components', 'components'],
            ['type-parent', 'parent', 'type-sibling', 'sibling'],
            ['type-index', 'index'],
            'unknown'
          ],
          customGroups: [
            {groupName: 'react/next', elementNamePattern: '^react$|^react-dom$|^next(?:/.*)?$'},
            {
              groupName: 'type-react/next',
              elementNamePattern: '^react$|^react-dom$|^next(?:/.*)?$',
              modifiers: ['type']
            },
            {groupName: 'config', elementNamePattern: '^@/config(?:/.*)?$'},
            {groupName: 'type-config', elementNamePattern: '^@/config(?:/.*)?$', modifiers: ['type']},
            {groupName: 'constants', elementNamePattern: '^@/constants(?:/.*)?$'},
            {groupName: 'type-constants', elementNamePattern: '^@/constants(?:/.*)?$', modifiers: ['type']},
            {groupName: 'types', elementNamePattern: '^@/types(?:/.*)?$'},
            {groupName: 'type-types', elementNamePattern: '^@/types(?:/.*)?$', modifiers: ['type']},
            {groupName: 'lib', elementNamePattern: '^@/lib(?:/.*)?$'},
            {groupName: 'type-lib', elementNamePattern: '^@/lib(?:/.*)?$', modifiers: ['type']},
            {groupName: 'providers', elementNamePattern: '^@/providers(?:/.*)?$'},
            {groupName: 'type-providers', elementNamePattern: '^@/providers(?:/.*)?$', modifiers: ['type']},
            {groupName: 'repositories', elementNamePattern: '^@/repositories(?:/.*)?$'},
            {groupName: 'type-repositories', elementNamePattern: '^@/repositories(?:/.*)?$', modifiers: ['type']},
            {groupName: 'services', elementNamePattern: '^@/services(?:/.*)?$'},
            {groupName: 'type-services', elementNamePattern: '^@/services(?:/.*)?$', modifiers: ['type']},
            {groupName: 'actions', elementNamePattern: '^@/actions(?:/.*)?$'},
            {groupName: 'type-actions', elementNamePattern: '^@/actions(?:/.*)?$', modifiers: ['type']},
            {groupName: 'store', elementNamePattern: '^@/store(?:/.*)?$'},
            {groupName: 'type-store', elementNamePattern: '^@/store(?:/.*)?$', modifiers: ['type']},
            {groupName: 'hooks', elementNamePattern: '^@/hooks(?:/.*)?$'},
            {groupName: 'type-hooks', elementNamePattern: '^@/hooks(?:/.*)?$', modifiers: ['type']},
            {groupName: 'locales', elementNamePattern: '^@/locales(?:/.*)?$'},
            {groupName: 'type-locales', elementNamePattern: '^@/locales(?:/.*)?$', modifiers: ['type']},
            {groupName: 'components', elementNamePattern: '^@/components(?:/.*)?$'},
            {groupName: 'type-components', elementNamePattern: '^@/components(?:/.*)?$', modifiers: ['type']}
          ]
        }
      ]
    }
  },
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Playwright generated files:
    'playwright-report/**',
    'test-results/**',
    'playwright/.auth/**',
    // Supabase generated files
    'supabase/**',
    // Generated database types
    'src/types/database.types.ts'
  ])
]);

export default eslintConfig;

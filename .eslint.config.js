export default {
  root: true,
  extends: ['eslint:recommended', 'plugin:json/recommended', 'prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  env: {
    node: true,
    //commonjs: true,
    es2021: true,
  },
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'never',
        exports: 'never',
        functions: 'never',
      },
    ],
  },
  ignores: ['docs/**'],
}

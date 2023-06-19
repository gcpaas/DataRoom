/*
 * @Author: wujian
 * @Date: 2022-05-31 09:27:01
 * @LastEditors: xing.heng
 * @LastEditTime: 2023-05-17 22:48:17
 */
module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser',
    sourceType: 'module',
    ecmaVersion: 2015
  },
  plugins: ['vue'],
  env: {
    browser: true,
    node: true,
    es6: true
  },
  rules: {
    // 忽略console警告
    'no-console': 'off',
    // 忽略v-html警告
    'vue/no-v-html': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'off',
    'no-prototype-builtins': 'off',
    'array-callback-return': 'off',
    'prefer-regex-literals': 'off',
    'multiline-ternary': 'off',
    'vue/order-in-components': 'off',
    'no-eval': 'off',
    'vue/no-template-shadow': 'off'
  },
  extends: [
    'plugin:vue/recommended',
    'eslint:recommended',
    '@vue/standard' // 使eslint继承standard标准
  ]
}

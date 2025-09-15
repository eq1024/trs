// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default (options = {}, ...userConfigs) => {
  const { rules: optionRules, ...restOptions } = options

  return antfu(
    {
      rules: {
        'no-console': 'error',
        // 因为ES6的展开语法 相同key会覆盖 所以这里需要深层合并
        ...optionRules,
      },
      ...restOptions,
      // From the second arguments they are ESLint Flat Configs
      // you can have multiple configs
    },
    ...userConfigs,
  )
}

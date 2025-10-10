// 导出一个只读的配置代理，防止外部直接修改
export function appConfig(key) {
  if (typeof key !== 'string') {
    throw new TypeError('Config key must be a string')
  }
  if (!key) {
    throw new Error('Config key must be provided')
  }
  console.warn('key is:', key)

  const value = (import.meta.env ? import.meta.env[key] : undefined) || (typeof require('node:process') !== 'undefined' && require('node:process').env ? require('node:process').env[key] : undefined)
  console.warn(`appConfig(${key}) = ${value}`)
  return value
}

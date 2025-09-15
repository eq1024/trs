// 导出一个只读的配置代理，防止外部直接修改
export const appConfig = function (key) {
  if (typeof key !== 'string') {
    throw new Error('Config key must be a string');
  }
  if (!key) {
    throw new Error('Config key must be provided');
  }
  console.log('key is:', key);

  const value = (import.meta.env ? import.meta.env[key] : undefined) || (typeof process !== 'undefined' && process.env ? process.env[key] : undefined);
  console.log(`appConfig(${key}) = ${value}`);
  return value;
};

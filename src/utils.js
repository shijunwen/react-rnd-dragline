/*
 * @Author: shijunwen
 * @Email: shijunwen@njsdata.com
 * @LastEditors: shijunwen
 * @Date: 2020-10-26 17:42:39
 * @LastEditTime: 2020-11-16 13:17:15
 * @Description: 请描述文件作用
 */
export const noop = () => {};

export function unique(array, compare = (a, b) => a === b) {
  const result = [];
  for (let i = 0, len = array.length; i < len; i++) {
    const current = array[i];
    if (result.findIndex(v => compare(v, current)) === -1) {
      result.push(current);
    }
  }
  return result;
}

export const checkArrayWithPush = (target, key, value) => {
  if (Array.isArray(target[key])) {
    target[key].push(value);
  } else {
    target[key] = [value];
  }
};

export const getMaxDistance = arr => {
  const num = arr.sort((a, b) => a - b);
  return num[num.length - 1] - num[0];
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  noop,
  unique,
  checkArrayWithPush,
};

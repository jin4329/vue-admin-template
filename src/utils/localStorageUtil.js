export function saveObjArr(name, data) {
  localStorage.setItem(name, JSON.stringify(data))
}

export function getObjArr(name) { // localStorage 获取数组对象的方法
  return JSON.parse(window.localStorage.getItem(name))
}

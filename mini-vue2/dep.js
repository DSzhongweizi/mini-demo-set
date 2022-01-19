export default class Dep {
  constructor() {
    this.deps = new Set()
  }

  add(dep) {
    //判断dep是否存在并且是否存在update方法,然后添加到存储的依赖数据结构中
    if (dep && dep.update) this.deps.add(dep)
  }
  notify() {
    // 遍历dep，然后调用每一个dep的update方法，发布通知使得每一个依赖都会进行更新
    this.deps.forEach(dep => dep.update())
  }
}

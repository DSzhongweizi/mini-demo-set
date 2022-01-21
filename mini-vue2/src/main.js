import Observer from './Observer.js'
import Compiler from './compiler.js'

import { _isNaN } from './util.js'
export default class Vue2 {
  constructor(options = {}) {
    //保存根元素，不考虑数组情况
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    this.$methods = options.methods
    this.$data = options.data
    this.$options = options

    // 将$data上的所有属性代理到this上
    this.proxy(this.$data)
    // 观察数据，将所有属性转为响应式
    new Observer(this.$data)
    // 编译模板，必须在观察数据之后
    new Compiler(this)
  }

  proxy(data) {
    // 遍历代理
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key]
        },
        set(newValue) {
          //判断一下如果值没有做改变就不用赋值，需要排除NaN的情况
          if (newValue === data[key] || _isNaN(newValue, data[key])) return
          data[key] = newValue
        }
      })
    })
  }
}

import Watcher from './watcher.js'
export default class Compiler {
  constructor(vm) {
    //根元素
    this.el = vm.$el
    //事件方法
    this.methods = vm.$methods
    //当前组件实例
    this.vm = vm
    //调用编译函数开始编译
    this.compile(vm.$el)
  }
  compile(el) {
    //拿到所有子节点（包含文本节点）
    let childNodes = el.childNodes
    //转成数组
    Array.from(childNodes).forEach(node => {
      //判断是文本节点还是元素节点分别执行不同的编译方法
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        this.compileElement(node)
      }
      //递归判断node下是否还含有子节点，如果有的话继续编译
      if (node.childNodes && node.childNodes.length) this.compile(node)
    })
  }

  compileText(node) {
    //定义正则，匹配{{}}中的count
    let reg = /\{\{(.+?)\}\}/g
    let value = node.textContent
    //判断是否含有{{}}
    if (reg.test(value)) {
      //拿到{{}}中的count,由于我们是匹配一个捕获组，所以我们可以根据RegExp类的$1属性来获取这个count
      let key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key])
      //如果更新了值，还要做更改
      new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
      })
    }
  }

  compileElement(node) {
    //指令不就是一堆属性吗，所以我们只需要获取属性即可
    const attrs = node.attributes
    if (attrs.length) {
      Array.from(attrs).forEach(attr => {
        //这里由于我们拿到的attributes可能包含不是指令的属性，所以我们需要先做一次判断
        if (this.isDirective(attr.name)) {
          //根据v-来截取一下后缀属性名,例如v-on:click,substr(5)即可截取到click,v-text与v-model则substr(2)截取到text和model即可
          let attrName = attr.name.indexOf(':') > -1 ? attr.name.substr(5) : attr.name.substr(2)
          let key = attr.value
          //单独定义一个update方法来区分这些
          this.update(node, attrName, key, this.vm[key])
        }
      })
    }
  }
  update(node, attrName, key, value) {
    //update函数内部
    if (attrName === 'text') {
      //执行v-text的操作
      node.textContent = value
      new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
      })
    } else if (attrName === 'model') {
      //执行v-model的操作
      node.value = value
      new Watcher(this.vm, key, newValue => {
        node.value = newValue
      })
      node.addEventListener('input', e => {
        this.vm[key] = node.value
      })
    } else if (attrName === 'click') {
      //执行v-on:click的操作
      node.addEventListener(attrName, this.methods[key].bind(this.vm))
    }
  }

  isTextNode(node) {
    return node.nodeType === 3
  }
  isElementNode(node) {
    return node.nodeType === 1
  }
  isDirective(dir) {
    return dir.startsWith('v-')
  }
}

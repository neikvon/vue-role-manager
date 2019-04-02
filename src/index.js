import Manager from './Manager'
import directive from './directive'
import { version } from '../package.json'

function plugin (Vue, opts) {
  const manager = new Manager(Vue, opts)

  // router hook
  if (opts.router && opts.enabled !== false) {
    opts.router.beforeEach((to, from, next) => manager.resolve(to, from, next))
  }

  // prototype
  Vue.prototype.$vrm = manager

  // directive
  Vue.directive('roles', directive(manager))
}

plugin.version = version

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin)
}

export default plugin

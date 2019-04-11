// Fork from 'https://github.com/anthonygore/vue-router-user-roles/blob/master/src/RouteProtect.js'

export default class Manager {
  constructor (
    Vue,
    {
      router = null,
      redirect = 'login',
      metaName = 'roles',
      whitelist = [],
      debug = process.env.NODE_ENV === 'development',
      enabled = true
    } = {}
  ) {
    this.router = router
    this.defaultRedirect = redirect
    this.metaName = metaName
    this.whitelist = Array.isArray(whitelist) ? whitelist : [whitelist]
    this.debug = debug
    this.enabled = enabled

    this.vm = new Vue({
      data: {
        userRoles: null
      }
    })

    this.allRoutes = this.router.options.routes || []
    this.tmpRoute = null
  }

  getRoles () {
    if (!this.vm.userRoles) {
      throw new Error('Attempt to access user roles before being set')
    }
    return this.vm.userRoles
  }

  setRoles (roles) {
    this.vm.userRoles = roles
    if (this.to && this.router) {
      const { access, redirect } = this.hasAccessToRoute(this.to)
      if (!access) {
        this.router.push({
          name: redirect,
          query: {
            redirect: this.to.path
          }
        })
      }
    }
  }

  hasAccess (_configs) {
    if (!_configs) {
      throw new Error('param is required')
    }
    const configs = Array.isArray(_configs) ? _configs : [_configs]
    const roles = this._wrapUserRoles()
    return roles.some(role => configs.includes(role))
  }

  /**
   * Add routes
   * addRoutes([routesConfig])
   * addRoutes([routesConfig], '/parent')
   * addRoutes([routesConfig], 'parent')
   * addRoutes([routesConfig], { path: '/parent' })
   * addRoutes([routesConfig], { name: 'parent' })
   * @param {Array} routes
   * @param {String|Object} parent
   * @returns
   * @memberof Manager
   */
  addRoutes (routes, parent) {
    if (!routes || routes.length < 1) {
      return {
        allRoutes: this.allRoutes
      }
    }

    let matchedRoute
    if (parent) {
      let _parent = parent
      if (typeof parent === 'string') {
        _parent = parent.startsWith('/')
          ? {
            path: parent
          }
          : {
            name: parent
          }
      }
      matchedRoute = _parent.name
        ? this.findRouteByName(_parent.name)
        : this.allRoutes.find(r => r.path === _parent.path)

      if (!matchedRoute) {
        return {
          allRoutes: this.allRoutes
        }
      }
    }

    const _routes = Array.isArray(routes) ? routes : [routes]
    const allowdRoutes = this.enabled
      ? this._routesFilterByRole(_routes, true)
      : _routes

    if (!allowdRoutes || allowdRoutes.length < 0) {
      return {
        allRoutes: this.allRoutes
      }
    }

    if (parent) {
      matchedRoute.children = matchedRoute.children || []
      matchedRoute.children = matchedRoute.children.concat(allowdRoutes)
    } else {
      matchedRoute = allowdRoutes
      this.allRoutes = this.allRoutes.concat(allowdRoutes)
    }

    this.router.addRoutes(
      Array.isArray(matchedRoute) ? matchedRoute : [matchedRoute],
      {
        replace: true
      }
    )

    return {
      addedRoutes: matchedRoute,
      allRoutes: this.allRoutes
    }
  }
  resolve (to, from, next) {
    this.to = to
    const { access, redirect, skipped } = this.hasAccessToRoute(to)

    if (this.debug && !skipped) {
      console.log(
        '[VRM] roles:',
        this.vm.userRoles,
        'route:',
        to,
        `=> ${!access ? 'DENY, redirect to  "' + redirect + '"' : 'ALLOW'} `
      )
    }

    access
      ? next()
      : next({
        name: redirect,
        query: {
          redirect: to.path
        }
      })
  }

  hasAccessToRoute (route, isFilter) {
    const _route =
      typeof route === 'string' ? this.router.resolve(route).route : route

    if (this.whitelist.includes(_route.name)) {
      if (this.debug) {
        console.log('[VRM] skipped:', _route.name)
      }
      return {
        access: true,
        skipped: true
      }
    }

    // user roles
    const roles = this._wrapUserRoles()
    const routes = _route.matched || [_route]

    let result
    for (let i = routes.length - 1; i >= 0; i--) {
      const item = routes[i]

      const configs = this._getMetaRoles(item)

      if (configs.deny && roles.some(r => configs.deny.includes(r))) {
        result = {
          access: false,
          redirect: configs.redirect
        }

        break
      } else if (configs.allow && !roles.some(r => configs.allow.includes(r))) {
        result = {
          access: false,
          redirect: configs.redirect
        }
        break
      }
    }

    if (isFilter && this.debug) {
      console.log('[VRM] filter:', _route.path, result ? 'DENY' : 'ALLOW')
    }

    return (
      result || {
        access: true
      }
    )
  }

  findRouteByName (name, routes = this.allRoutes) {
    if (this.tmpRoute) {
      this.tmpRoute = null
    }
    if (!name || !Array.isArray(routes)) {
      return null
    }

    for (let i = 0, len = routes.length; i < len; i++) {
      const item = routes[i]
      if (item.name === name) {
        this.tmpRoute = item
      } else if (Array.isArray(item.children)) {
        this.findRouteByName(name, item.children)
      }
      if (this.tmpRoute) {
        break
      }
    }

    return this.tmpRoute
  }

  /**
   * getRolesFromMeta
   *
   m: (user, route) => {
     return {
       allow: 'role1',
       deny: 'role3',
       redirect: ''
     }
   }

   m: 'role1'
   m: 1

   m: ['role1', 'role2']
   m: [1, 2]

   m: {
     allow: 'role1',
     deny: 'role3',
     redirect: ''
   }

   m: {
     allow: ['role1', 'role2'],
     deny: ['role3']
   }

   m: {
     allow: (user, route) => {
       return ['role1', 'role2']
     }
   }
   * @param {*} route
   * @returns
   * @memberof Manager
   */
  _getMetaRoles (route) {
    const configs = {
      allow: null,
      deny: null,
      redirect: null
    }

    if (!route.meta || !route.meta[this.metaName]) {
      return configs
    }

    const meta = route.meta[this.metaName]

    if (typeof meta === 'function') {
      return meta(this.vm.userRoles, route)
    }

    configs.redirect = meta.redirect || this.defaultRedirect

    if (this._isValidRoleName(meta)) {
      configs.allow = [meta]
      return configs
    }

    if (Array.isArray(meta)) {
      configs.allow = meta.filter(this._isValidRoleName)
      return configs
    }

    if (this._isJson(meta)) {
      if (meta.allow) {
        if (Array.isArray(meta.allow)) {
          configs.allow = meta.allow.filter(this._isValidRoleName)
        } else if (typeof meta.allow === 'function') {
          const _meta = meta.allow(this.vm.userRoles, route)
          configs.allow = Array.isArray(_meta) ? _meta : [_meta]
        } else if (this._isValidRoleName(meta.allow)) {
          configs.allow = [meta.allow]
        }
      }
      if (meta.deny) {
        if (Array.isArray(meta.deny)) {
          configs.deny = meta.deny.filter(this._isValidRoleName)
        } else if (typeof meta.deny === 'function') {
          const _meta = meta.deny(this.vm.userRoles, route)
          configs.deny = Array.isArray(_meta) ? _meta : [_meta]
        } else if (this._isValidRoleName(meta.deny)) {
          configs.deny = [meta.deny]
        }
      }
    }

    return configs
  }

  _wrapUserRoles () {
    const roles = this.vm.userRoles
    if (!roles) {
      return []
    }

    return Array.isArray(roles) ? roles : [roles]
  }

  _routesFilterByRole (routes, isFilter) {
    const allowedRoutes = routes.filter(route => {
      const tmp = this.hasAccessToRoute(route, isFilter)
      if (tmp.access) {
        if (route.children && route.children.length) {
          route.children = this._routesFilterByRole(route.children, isFilter)
        }
        return true
      }
      return false
    })
    return allowedRoutes
  }

  _isValidRoleName (name) {
    return typeof name === 'string' || !isNaN(name)
  }

  _isJson (obj) {
    try {
      return obj.constructor === {}.constructor
    } catch (err) {}
    return false
  }
}

const isBoolean = value => typeof value === 'boolean'
const isArray = value => Array.isArray(value)
const isJson = obj => {
  try {
    return obj.constructor === {}.constructor
  } catch (err) {}
  return false
}
const isValidRoleName = name => typeof name === 'string' || !isNaN(name)

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
    this.whitelist = isArray(whitelist) ? whitelist : [whitelist]
    this.debug = debug
    this.enabled = enabled
    if (this.defaultRedirect) {
      this.whitelist.push(this.defaultRedirect)
    }

    this.vm = new Vue({
      data: {
        userRoles: []
      }
    })

    this.allRoutes = this.router.options.routes || []
    this.tmpRoute = null
  }

  /**
   * get current user's roles
   *
   * @returns
   * @memberof Manager
   */
  getRoles () {
    if (!isArray(this.vm.userRoles) || this.vm.userRoles.length < 1) {
      throw new Error('Attempt to access user roles before being set')
    }
    return this.vm.userRoles
  }

  /**
   * set current user's roles
   *
   * @param {*} roles
   * @memberof Manager
   */
  setRoles (roles) {
    this.vm.userRoles = roles ? (isArray(roles) ? roles : [roles]) : []
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

  /**
   * check current user's roles
   *
   * @param {*} roles roles to check
   * @returns
   * @memberof Manager
   */
  hasAccess (roles) {
    if (!roles) {
      throw new Error('Param is required')
    }
    const _roles = isArray(roles) ? roles : [roles]
    return this.vm.userRoles.some(role => _roles.includes(role))
  }

  /**
   * add routes
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

    const _routes = isArray(routes) ? routes : [routes]
    const allowdRoutes = this.enabled ? this._routesFilterByRole(_routes, true) : _routes

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

    this.router.addRoutes(isArray(matchedRoute) ? matchedRoute : [matchedRoute], {
      replace: true
    })

    return {
      addedRoutes: matchedRoute,
      allRoutes: this.allRoutes
    }
  }

  /**
   * resolve route
   *
   * @param {*} to
   * @param {*} from
   * @param {*} next
   * @memberof Manager
   */
  resolve (to, from, next) {
    this.to = to
    const { access, redirect, skipped } = this.hasAccessToRoute(to)

    if (this.debug && !skipped) {
      console.log(
        `[VRM] ${access ? 'ALLOW' : 'DENY'} "${to.fullPath}" from roles "${this.vm.userRoles.join(
          ','
        )}".`,
        !access ? `Redirect to ${redirect}.` : ''
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

  /**
   * check if the current user has access to a specified route
   *
   * @param {*} route string|route object
   * @param {*} isFilter
   * @returns
   * @memberof Manager
   */
  hasAccessToRoute (route, isFilter) {
    const currentRoute = typeof route === 'string' ? this.router.resolve(route).route : route

    if (this.whitelist.includes(currentRoute.name)) {
      if (this.debug) {
        console.log('[VRM] skipped:', currentRoute.name)
      }
      return {
        access: true,
        skipped: true
      }
    }

    const params = currentRoute.params
    const query = currentRoute.query
    const currentConfig = this._resolveConfigs(currentRoute, params, query)
    const currentAccess = this._resolvePermission(currentConfig)

    if (this.debug) {
      console.log('[VRM] configs:', currentConfig)
    }

    if (!currentAccess) {
      if (this.debug && isFilter) {
        console.log('[VRM] filter:', currentRoute.path, 'DENY')
      }
      return {
        access: false,
        redirect: currentConfig.redirect
      }
    }

    if (!currentConfig.inherit) {
      if (this.debug && isFilter) {
        console.log('[VRM] filter:', currentRoute.path, currentAccess ? 'ALLOW' : 'DENY')
      }
      return {
        access: currentAccess,
        redirect: currentConfig.redirect
      }
    }

    const parentRoutes = currentRoute.matched
      ? currentRoute.matched.slice(0, currentRoute.matched.length - 1)
      : []
    let result

    for (let i = parentRoutes.length - 1; i >= 0; i--) {
      const parent = parentRoutes[i]

      const configs = this._resolveConfigs(parent, params, query)
      if (!configs) {
        break
      }

      if (this.debug) {
        console.log('[VRM] configs:', configs)
      }

      const access = this._resolvePermission(configs)
      result = {
        access,
        redirect: configs.redirect
      }
      if (configs.strip || !access) {
        break
      }
    }

    if (this.debug && isFilter) {
      console.log('[VRM] filter:', currentRoute.path, result ? 'DENY' : 'ALLOW')
    }

    return (
      result || {
        access: true
      }
    )
  }

  /**
   * find the route by route name
   *
   * @param {*} name
   * @param {*} [routes=this.allRoutes]
   * @returns
   * @memberof Manager
   */
  findRouteByName (name, routes = this.allRoutes) {
    if (this.tmpRoute) {
      this.tmpRoute = null
    }
    if (!name || !isArray(routes)) {
      return null
    }

    for (let i = 0, len = routes.length; i < len; i++) {
      const item = routes[i]
      if (item.name === name) {
        this.tmpRoute = item
      } else if (isArray(item.children)) {
        this.findRouteByName(name, item.children)
      }
      if (this.tmpRoute) {
        break
      }
    }

    return this.tmpRoute
  }

  /**
   * resolve configs
   *
   m: (user, route, params, query) => {
     return array|object|boolean
   }
   m: {
     allow: (user, route, params, query) => {
        return array|object|boolean
     }
   }
   m: {
     deny: (user, route, params, query) => {
        return array|object|boolean
     }
   }

   m: 'role1'|1

   m: ['role1', 'role2']

   m: {
     allow: 'role1',
     deny: 'role3',
     redirect: ''
   }

   m: {
     allow: ['role1', 'role2'],
     deny: ['role3']
   }

   * @param {*} route
   * @returns
   * @memberof Manager
   */
  _resolveConfigs (route, params, query) {
    const configs = {
      allow: null,
      deny: null,
      redirect: this.defaultRedirect,
      inherit: true
    }

    if (!route.meta || !route.meta[this.metaName]) {
      return configs
    }

    const meta = route.meta[this.metaName]

    if (typeof meta === 'function') {
      const result = meta(this.vm.userRoles, route, params, query)
      if (isBoolean(result)) {
        configs[result ? 'allow' : 'deny'] = true

        return configs
      }

      if (isArray(result)) {
        return Object.assign({}, configs, {
          allow: result
        })
      }

      return Object.assign({}, configs, result, {
        allow:
          isArray(result.allow) || isBoolean(result.allow) || !result.allow
            ? result.allow
            : [result.allow],
        deny:
          isArray(result.deny) || isBoolean(result.deny) || !result.deny
            ? result.deny
            : [result.deny]
      })
    }

    if (meta.redirect) {
      configs.redirect = meta.redirect
    }

    if (isValidRoleName(meta)) {
      configs.allow = [meta]
      return configs
    }

    if (isArray(meta)) {
      configs.allow = meta.filter(isValidRoleName)
      return configs
    }

    if (isJson(meta)) {
      if (meta.allow) {
        if (isArray(meta.allow)) {
          configs.allow = meta.allow.filter(isValidRoleName)
        } else if (typeof meta.allow === 'function') {
          const _meta = meta.allow(this.vm.userRoles, route, params, query)
          configs.allow = isArray(_meta) || isBoolean(_meta) || !_meta ? _meta : [_meta]
        } else if (isValidRoleName(meta.allow)) {
          configs.allow = [meta.allow]
        }
      }
      if (meta.deny) {
        if (isArray(meta.deny)) {
          configs.deny = meta.deny.filter(isValidRoleName)
        } else if (typeof meta.deny === 'function') {
          const _meta = meta.deny(this.vm.userRoles, route, params, query)
          configs.deny = isArray(_meta) || isBoolean(_meta) || !_meta ? _meta : [_meta]
        } else if (isValidRoleName(meta.deny)) {
          configs.deny = [meta.deny]
        }
      }
    }

    return configs
  }

  _resolvePermission (configs) {
    // deny
    if (isBoolean(configs.deny) && configs.deny) {
      return false
    } else if (isArray(configs.deny) && this.vm.userRoles.some(r => configs.deny.includes(r))) {
      return false
    }

    // allow
    if (isBoolean(configs.allow) && !configs.allow) {
      return false
    } else if (isArray(configs.allow) && !this.vm.userRoles.some(r => configs.allow.includes(r))) {
      return false
    }

    return true
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
}

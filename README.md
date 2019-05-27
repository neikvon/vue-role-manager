# Vue Role Manager

A Vue.js plugin that manage user roles. Including routes protect, vue directive.
Inspired by
[vue-router-user-roles](https://github.com/anthonygore/vue-router-user-roles)

## Installation

```js
import VRM from 'vue-role-manager'

Vue.use(VRM, options)
```

### options

- `router`: (required) Vue router instance
- `redirect`: (optional) Default redirect name. default: `'login'`
- `metaName`: (optional) Meta name in router config. default: `'roles'`
- `whitelist`: (optional) Array of route names. VRM will skip checking these
  routes. default: value of `redirect`
- `debug`: (optional) Show debug info in console or not. default: `false`
- `enabled`: (optional) Enable route filter by role or not. default: `true`

## Router config

```js
{
  path: '/home',
  name: 'home',
  component: home,
  meta: {
    roles
  }
}
```

### roles

- (Array of) String or Number

  ```js
  roles: 'role1'
  roles: 1

  roles: ['role1', 'role2']
  roles: [1, 2]
  ```

- Object

  ```js
  roles: {
    allow: 'role1',
    deny: 'role3',
    redirect: 'login',
    whitelist: ['login'],
    inherit: false // default: true. inherit parent route permission
  }

  roles: {
    allow: ['role1', 'role2'],
    deny: ['role3']
  }
  ```

- Function

  ```js
  /**
   * roles filter function
   *
   * @param {*} roles current user's roles
   * @param {*} route current route object
   * @param {*} params route params
   * @param {*} query route query
   * @returns string|array|boolean
   */
  roles: (roles, route, params, query) => {
    return {
      allow: 'role1',
      deny: 'role3',
      redirect: '401'
    }
  }

  roles: {
    /**
     * roles filter function
     *
     * @param {*} roles current user's roles
     * @param {*} route current route object
     * @param {*} params route params
     * @param {*} query route query
     * @returns string|array|boolean
     */
    allow: (roles, route, params, query) => {
      return ['role1', 'role2'] // string|array|boolean
    }
  }

  roles: {
    /**
     * roles filter function
     *
     * @param {*} roles current user's roles
     * @param {*} route current route object
     * @param {*} params route params
     * @param {*} query route query
     * @returns string|array|boolean
     */
    deny: (roles, route, params, query) => {
      return true // string|array|boolean
    }
  }
  ```

## Methods

- setRoles(string|array|null)

  ```js
  // set current user's roles
  Vue.prototype.$vrm.setRoles(userinfo.roles)

  this.$vrm.setRoles(null)
  ```

- getRoles()

  ```js
  // get current user's roles
  const userRoles = Vue.prototype.$vrm.getRoles()

  const userRoles = this.$vrm.getRoles()
  ```

- addRoutes([route configs][, parent])

  ```js
  const { allRoutes, addedRoutes } = this.$vrm.addRoutes([...])
  const { allRoutes, addedRoutes } = this.$vrm.addRoutes([...], 'parent-name')
  ```

- hasAccess([])

  ```js
  // check current user's role
  const hasAccess = this.$vrm.hasAccess(['admin', 'editor', 'publisher'])
  ```

- hasAccessToRoute(route)

  ```js
  const hasAccess = this.$vrm.hasAccessToRoute(string|route object)
  ```

- findRouteByName(name)

  ```js
  // check current user's role
  const route = this.$vrm.findRouteByName('route-name')
  ```

## Directive

- args

  - action
  - class

- modifiers

  - action: remove, hidden, disable
  - class: any string

- Examples

  ```html
  <!-- only create the button for 'admin' -->
  <button v-roles="['admin']">Remove</button>

  <!-- same as above -->
  <!-- action available value: 'remove', 'hidden , 'disable' -->
  <button v-roles:action.remove="['admin']">Remove</button>

  <!-- add class 'my-class-name' for those are neither 'admin' nor 'editor' -->
  <button v-roles:class.my-class-name="['admin', 'editor']">Edit</button>
  ```

## Real world examples

[examples/basic](./examples/basic)

## [CHANGELOG](CHANGELOG.md)

## License

[MIT](https://opensource.org/licenses/MIT)

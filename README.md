# Vue Role Manager

A Vue.js plugin that manage user roles. Including routes protect, vue directive.
Inspired by
[vue-router-user-roles](https://github.com/anthonygore/vue-router-user-roles)

## Installation

```js
import VRM from 'vue-role-manager'

Vue.use(VRM, options)
```

**options**

- `router`: (required) Vue router instance
- `redirect`: (optional) Default redirect name. default: `'login'`
- `metaName`: (optional) Meta name in router config. default: `'roles'`
- `whitelist`: (optional) Array of route names. VRM will skip checking these
  routes.
- `debug`: (optional) Show debug info in console or not. default: `false`

## Router config

```js
{
  path: '/home',
  name: 'home,
  component: home,
  meta: {
    roles
  }
}
```

**roles**

```js
// String or Number
roles: 'role1'
roles: 1

// Array of String or Number
roles: ['role1', 'role2']
roles: [1, 2]

// Object
roles: {
  allow: 'role1',
  deny: 'role3',
  redirect: 'login',
  whitelist: ['login']
}

roles: {
  allow: ['role1', 'role2'],
  deny: ['role3']
}

// Function
// roles: current user roles
// route: current route object
roles: {
  allow: (roles, route) => {
    return ['role1', 'role2']
  }
}

roles: (roles, route) => {
  return {
    allow: 'role1',
    deny: 'role3',
    redirect: '401'
  }
}
```

## Methods

**setRoles**

```js
// set current user's roles
Vue.prototype.$vrm.setRoles(userinfo.roles)

this.$vrm.setRoles(null)
```

**getRoles**

```js
// get current user's roles
Vue.prototype.$vrm.getRoles()

this.$vrm.getRoles()
```

**hasAccess**

```js
// check current user's role
this.$vrm.hasAccess(['admin', 'editor', 'publisher'])
```

**addRoutes**

```js
const filteredNewRoutes = this.$vrm.addRoutes([...])
// return filtered new route base on current user's roles
```

## Directive

**arg**

- action
- class

**modifiers**

- action: remove, hidden, disable
- class: any string

**Examples**

```html
<!-- only create the button for 'admin' -->
<button v-roles="['admin']">Remove</button>

<!-- same as above -->
<!-- action available value: 'remove', 'hidden , 'disable' -->
<button v-roles:action.remove="['admin']">Remove</button>

<!-- add class 'my-class-name' for those are neither 'admin' nor 'editor' -->
<button v-roles:class.my-class-name="['admin', 'editor']">Edit</button>
```

## [CHANGELOG](CHANGELOG.md)

## License

[MIT](https://opensource.org/licenses/MIT)

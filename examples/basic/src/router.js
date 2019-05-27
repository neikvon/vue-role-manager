import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import(/* webpackChunkName: "about" */ './views/Home.vue')
    },
    {
      path: '/user',
      name: 'user',
      component: () => import(/* webpackChunkName: "about" */ './views/User.vue'),
      meta: {
        roles: 'user'
      }
    },
    {
      path: '/admin/:id',
      name: 'admin',
      component: () => import(/* webpackChunkName: "about" */ './views/Admin.vue'),
      meta: {
        /**
         * roles filter function
         *
         * @param {*} roles current user roles
         * @param {*} route current route object
         * @param {*} params route params
         * @param {*} query route query
         * @returns string|array|boolean
         */
        roles: (roles, route, params, query) => {
          console.log(roles, route, params, query)
          return params.id === '222'
        }
      }
    },
    {
      path: '/super/:id',
      name: 'super',
      // component: () => import(/* webpackChunkName: "about" */ './views/Super.vue'),
      component: {
        template: `<div class="super">
          <h2>super</h2>
          <router-view></router-view>
        </div>`
      },
      meta: {
        roles: {
          allow: (roles, route, params, query) => {
            console.log(roles, route, params, query)
            return ['super']
            // return true
            // return false
          }
        }
      },
      children: [
        {
          path: 'level-2/:name',
          name: 'level-2',
          component: {
            template: `<div class="level-2">
              <h3>super level-2</h3>
              <router-view></router-view>
            </div>`
          },
          meta: {
            roles () {
              return {
                allow: 'user',
                inherit: false
              }
            }
          },
          children: [
            {
              path: 'level-3/:gender',
              name: 'level-3',
              component: {
                template: `<div class="level-3">
                  <h4>super level-3</h4>
                </div>`
              },
              meta: {
                roles: {
                  deny: (roles, route, params, query) => {
                    console.log(roles, route, params, query)
                    return ['user']
                    // return true
                    // return false
                  }
                }
              },
              children: []
            }
          ]
        }
      ]
    },
    {
      path: '/403',
      name: '403',
      component: () => import(/* webpackChunkName: "about" */ './views/403.vue')
    }
  ]
})

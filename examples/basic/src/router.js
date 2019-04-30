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
        roles: (roles, route) => {
          return ['admin']
        }
      }
    },
    {
      path: '/super',
      name: 'super',
      component: () => import(/* webpackChunkName: "about" */ './views/Super.vue'),
      meta: {
        roles: {
          allow: (roles, route) => {
            return ['super']
          }
        }
      }
    },
    {
      path: '/403',
      name: '403',
      component: () => import(/* webpackChunkName: "about" */ './views/403.vue')
    }
  ]
})

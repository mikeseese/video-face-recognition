import Vue from 'vue'
import Router from 'vue-router'
import AppLayout from '../components/admin/AppLayout'
import AuthLayout from '../components/auth/AuthLayout'
import lazyLoading from './lazyLoading'
import store from "../store"

Vue.use(Router)

const demoRoutes = []
if (process.env.NODE_ENV === 'development') {
  const VueBook = require('vue-book')

  demoRoutes.push(
    VueBook.createRoute({
      requireContext: require.context('./..', true, /.demo.vue$/),
      path: '/demo',
    }),
    VueBook.createRoute({
      requireContext: require.context('./../components', true, /.vue$/),
      path: '/presentation',
    }),
  )

  Vue.use(VueBook.VueBookComponents)
}

const EmptyParentComponent = {
  template: '<router-view></router-view>',
}

const router = new Router({
  routes: [
    ...demoRoutes,
    {
      path: '*',
      redirect: { name: 'dashboard' },
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          name: 'login',
          path: 'login',
          component: lazyLoading('auth/login/Login'),
        },
        {
          path: '',
          redirect: { name: 'login' },
        },
      ],
    },
    {
      path: '/404',
      component: EmptyParentComponent,
      children: [
        {
          name: 'not-found-advanced',
          path: 'not-found-advanced',
          component: lazyLoading('pages/404-pages/VuesticPageNotFoundSearch'),
        },
        {
          name: 'not-found-simple',
          path: 'not-found-simple',
          component: lazyLoading('pages/404-pages/VuesticPageNotFoundSimple'),
        },
        {
          name: 'not-found-custom',
          path: 'not-found-custom',
          component: lazyLoading('pages/404-pages/VuesticPageNotFoundCustom'),
        },
        {
          name: 'not-found-large-text',
          path: '/pages/not-found-large-text',
          component: lazyLoading('pages/404-pages/VuesticPageNotFoundLargeText'),
        },
      ],
    },
    {
      name: 'Admin',
      path: '/admin',
      component: AppLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          name: 'dashboard',
          path: 'dashboard',
          component: lazyLoading('dashboard/Dashboard'),
          default: true,
          meta: {
            requiresAuth: true,
          },
        },
        {
          name: 'train',
          path: 'train',
          component: lazyLoading('train/Train'),
          default: true,
          meta: {
            requiresAuth: true,
          },
        },
        {
          name: 'system',
          path: 'system',
          component: lazyLoading('system/System'),
          default: true,
          meta: {
            requiresAuth: true,
          },
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (store.getters.isLoggedIn) {
      next()
      return
    }
    next('/auth/login')
  } else {
    next() 
  }
})

export default router;

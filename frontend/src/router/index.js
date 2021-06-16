import Vue from 'vue'
import VueRouter from 'vue-router'
import PuzzleList from '../components/PuzzleList.vue'
import PuzzleEditor from '@/components/PuzzleEditor'
import NewInstanceEditor from '@/components/NewInstanceEditor'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'PuzzleList',
    component: PuzzleList
  },
  {
    path: '/puzzle/:id',
    name: 'PuzzleEditor',
    component: PuzzleEditor,
    props: route => ({id: parseInt(route.params.id)})
  },
  {
    path: '/puzzle/:id/new-instance',
    name: 'NewInstanceEditor',
    component: NewInstanceEditor,
    props: route => ({puzzleId: parseInt(route.params.id)})
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

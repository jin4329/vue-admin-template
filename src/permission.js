import router from './router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import { getObjArr, saveObjArr } from '@/utils/localStorageUtil'
import Layout from '@/layout'

// import Layout from '@/views/layout/Layout' // Layout 是架构组件，不在后台返回，在文件里单独引入

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist
const _import = require('./router/_import_' + process.env.NODE_ENV)
var getRouter

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  if (getToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      window.localStorage.clear()
      next('/login')
      NProgress.done()
    }
  }
  if (!getRouter) { // 不加这个判断，路由会陷入死循环
    if (!getObjArr('routers')) {
      // getRouter = rouerConfig // 后台拿到路由
      getRouter = JSON.parse(window.localStorage.getItem('routerList')) // 后台拿到路由
      if (!getRouter) {
        console.log('没拿到返回数据')
        return false
      }
      saveObjArr('routers', getRouter) // 存储路由到localStorage
      routerGo(to, next) // 执行路由跳转方法
      // axios.get('https://www.easy-mock.com/mock/5a5da330d9b48c260cb42ca8/example/antrouter').then(res => {
      //   console.log(res)
      //   getRouter = res.data.data.router//后台拿到路由
      //   saveObjArr('routers', getRouter) //存储路由到localStorage
      //   routerGo(to, next)//执行路由跳转方法
      // })
    } else { // 从localStorage拿到了路由
      getRouter = getObjArr('routers') // 拿到路由
      routerGo(to, next)
    }
  } else {
    next()
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

function routerGo(to, next) {
  getRouter = filterAsyncRouter(getRouter) // 过滤路由
  getRouter.push({ path: '*', redirect: '/404', hidden: true })
  console.log(getRouter)
  router.addRoutes(getRouter) // 动态添加路由
  global.antRouter = getRouter // 将路由数据传递给全局变量，做侧边栏菜单渲染工作
  next({ ...to, replace: true })
}

// 递归操作
function filterAsyncRouter(asyncRouterMap) { // 遍历后台传来的路由字符串，转换为组件对象
  return asyncRouterMap.filter(route => {
    if (route.component) {
      if (route.component === 'Layout') { // Layout组件特殊处理
        route.component = Layout
      } else {
        route.component = _import(route.component)
      }
    } else {
      delete route.component
    }
    if (route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })
}

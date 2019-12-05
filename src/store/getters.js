const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  tel: state => state.user.tel,
  roles: state => state.user.roles,
  permission_routes: () => global.antRouter
}
export default getters

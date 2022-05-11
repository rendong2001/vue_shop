<template>
  <div>
    <el-container class="home_container">
      <!-- 头部区域 -->
      <el-header>
        <div class="head">
          <img src="../assets/1.png" alt="" />
          <span>电商后台管理系统</span>
        </div>
        <el-button type="warning" @click="logout" circle icon="el-icon-switch-button"></el-button>
      </el-header>
      <!-- 页面主体 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'" ref="asideRef">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <el-menu
            background-color="#1a5e71"
            text-color="#fff"
            active-text-color="#FFE081"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            router
            :default-active="activePath"
          >
            <!-- 一级菜单 -->
            <el-submenu :index="String(item.id)" v-for="item in menuList" :key="item.id">
              <!-- 一级菜单模板区 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{ item.authName }}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                <template slot="title">
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 文本 -->
                  <span>{{ subItem.authName }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 内容主体 -->
        <el-main><router-view></router-view></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //左侧菜单数据
      menuList: [],
      //左侧菜单图标自定义
      iconsObj: {
        125: 'el-icon-user',
        103: 'el-icon-remove-outline',
        101: 'el-icon-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data'
      },
      //左侧菜单栏是否折叠
      isCollapse: false,
      //激活的菜单
      activePath: ''
    }
  },
  methods: {
    //退出登录
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
      this.$message.warning('退出了')
    },
    //获取左侧列表
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取左侧列表数据失败')
      this.menuList = res.data
    },
    //控制左侧文本的显示
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //将导航链接保存到
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100vh;
}
.el-header {
  background-color: #2f4858;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
  .head {
    width: 300px;
    height: 60px;
    display: flex;
    align-items: center;
    img {
      width: 60px;
      border-radius: 50%;
    }
    span {
      margin-left: 5px;
    }
  }
}
.el-aside {
  background-color: #1a5e71;
}
.el-main {
  background-color: #e7eada;
}
.el-menu {
  border-right: none;
}
.toggle-button {
  background-color: #3b4a3f;
  font-size: 15px;
  line-height: 25px;
  color: white;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>

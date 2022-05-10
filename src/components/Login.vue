<template>
  <div class="login_container">
    <!-- 登录div -->
    <div class="login_box">
      <!-- 头像 -->
      <div class="head_box">
        <img src="../assets/11.jpg" alt="" />
      </div>
      <!-- 表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <el-form-item prop="username">
          <el-input placeholder="请输入用户名" v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" placeholder="请输入密码" v-model="loginForm.password" show-password prefix-icon="el-icon-key"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="success" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义密码验证规则
    const validatePassword = (rule, value, cb) => {
      let reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{4,8}$/
      if (!reg.test(value)) {
        cb(new Error('密码必须4-8位 且为字母+数字组合'))
      } else {
        cb()
      }
    }
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      //表单的验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
          // { validator: validatePassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //登录
    login() {
      //进行一个表单的预验证
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          //发起axios请求
          const { data: res } = await this.$http.post('login', { username: this.loginForm.username, password: this.loginForm.password })
          if (res.meta.status === 200) {
            console.log(res)
            this.$message.success('登录成功！')
            // 1、将登录成功之后的token，保存到客户端的 sessionStorage中
            //   项目中的除了登录之外的接口，必须在登录之后才能访问
            //   token只在网站打卡期间有效，所以存放在 sessionStorage中
            // 2、跳转的/home主页
            window.sessionStorage.setItem('token', res.data.token)
            this.$router.push('/home')
          } else {
            this.$message.error('登录失败！')
          }
        } else {
          return
        }
      })
    },
    //重置表单数据
    reset() {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: rgb(229, 232, 63);
  height: 100vh;
  .login_box {
    height: 300px;
    width: 450px;
    border-radius: 5px;
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .head_box {
      width: 120px;
      height: 120px;
      padding: 5px;
      border: 3px solid #eee;
      border-radius: 50%;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
  }
}
.login_form {
  position: absolute;
  width: 100%;
  bottom: 0;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: space-between;
}
</style>

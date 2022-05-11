<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" class="input-with-select" v-model="queryInfo.query" clearable @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5"><el-button type="success" round @click="addDialogVisiable = true">添加用户</el-button></el-col>
      </el-row>
      <el-table :data="userList" border style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <div>
              <!-- {{ scope.row.mg_state }} -->
            </div>
            <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949" @change="userStateChange(scope.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="" label="操作">
          <template slot-scope="scope">
            <div>
              <el-button @click="showEditDialog(scope.row.id)" size="small" type="primary" icon="el-icon-edit" circle></el-button>
              <el-button @click="removeUserById(scope.row.id)" size="small" type="danger" icon="el-icon-delete" circle></el-button>
              <el-tooltip class="item" effect="light" content="分配角色" placement="top" :enterable="false" transition="none">
                <el-button size="small" type="warning" icon="el-icon-setting" circle></el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisiable" width="50%" @close="dialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="addUsers">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="editDialogVisiable" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo(editForm)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Uses',
  data() {
    //邮箱校验规则
    const validateEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    //手机号校验规则
    const validateMobile = (rule, value, cb) => {
      const regMobile = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确的手机号'))
    }
    return {
      //获取用户列表的数据对象
      queryInfo: {
        query: '', //查询参数
        pagenum: 1, //当前页码
        pagesize: 4 //每页显示的条目
      },
      userList: [], //用户数据列表
      total: 0, //总条数
      addDialogVisiable: false, //对话框的显示
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      }, //添加用户的表单数据
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名3-10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名6-15个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      }, //添加表单的验证规则对象
      editDialogVisiable: false, //修改用户的对话框的显示与隐藏
      editForm: {}, //查询到的用户信息对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      } //编辑用户的验证规则对象
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.userList = res.data.users
      this.total = res.data.total
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    //监听pagenum改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //监听状态的变化
    async userStateChange(userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户状态更新失败')
      }
      this.$message.success('用户状态更新成功')
    },
    //对话框关闭事件，重置表单数据
    dialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    //添加用户
    addUsers() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (valid) {
          //发起添加用户的axios请求
          const { data: res } = await this.$http.post('/users', this.addForm)
          console.log(res)
          if (res.meta.status !== 201) this.$message.error('用户添加失败')
          this.$message.success('用户添加成功')
          this.addDialogVisiable = false
          this.getUserList()
        } else return
      })
    },
    //修改用户的对话框
    async showEditDialog(id) {
      console.log(id)
      const { data: res } = await this.$http.get('/users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisiable = true
    },
    //编辑表单对话框关闭，重置表单数据
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //修改用户信息并提交
    editUserInfo(editForm) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //发起修改用户信息的请求
        const { data: res } = await this.$http.put('/users/' + editForm.id, { email: editForm.email, mobile: editForm.mobile })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('用户信息更新失败')
        this.editDialogVisiable = false
        this.getUserList()
        this.$message.success('用户信息更新成功')
      })
    },
    //删除用户事件
    async removeUserById(id) {
      //弹框循环是否删除数据
      const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      //用户确定删除返回值字符串confirm，取消删除返回cancel
      if (confirmRes !== 'confirm') {
        return this.$message.info('用户取消了删除')
      }
      //发起删除用户的axios请求
      const { data: res } = await this.$http.delete('/users/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      //刷新请求数据
      this.getUserList()
      //消息提示刷新
      this.$message.success('删除用户成功')
    }
  }
}
</script>

<style lang="less" scoped></style>

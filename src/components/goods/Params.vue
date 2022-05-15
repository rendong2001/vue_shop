<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关的参数！" type="warning" :closable="false" show-icon> </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader v-model="selectedCateKeys" :props="cateProps" :options="cateList" @change="handleChange" clearable></el-cascader>
        </el-col>
      </el-row>
      <!-- Tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" round size="mini" :disabled="isBtnDisabled" @click="addDialogVisiable = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border style="width: 100%">
            <!-- 展开行列 -->
            <el-table-column type="expand" label="">
              <template slot-scope="scope">
                <div>
                  <!-- 循环渲染Tag标签 -->
                  <el-tag :key="i" v-for="(item, i) in scope.row.attr_vals" closable :disable-transitions="false" @close="handleClose(i, scope.row)">
                    {{ item }}
                  </el-tag>
                  <!-- 输入文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <!-- 添加的按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div>
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAttributes(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" round size="mini" :disabled="isBtnDisabled" @click="addDialogVisiable = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border style="width: 100%">
            <!-- 展开行列 -->
            <el-table-column type="expand" label="">
              <template slot-scope="scope">
                <div>
                  <!-- 循环渲染Tag标签 -->
                  <el-tag :key="i" v-for="(item, i) in scope.row.attr_vals" closable :disable-transitions="false" @close="handleClose(i, scope.row)">
                    {{ item }}
                  </el-tag>
                  <!-- 输入文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <!-- 添加的按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="属性名称"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div>
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="editAttributes(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加参数、属性的对话框 -->
      <el-dialog :title="'添加' + this.dialogText" :visible.sync="addDialogVisiable" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="dialogText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisiable = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 编辑参数、属性的对话框 -->
      <el-dialog :title="'修改' + this.dialogText" :visible.sync="editDialogVisiable" width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="dialogText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisiable = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有商品分类列表
      cateList: [],
      //级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //被激活的页签的名称
      activeName: 'many',
      //动态参数的数据
      manyTableData: [],
      //静态属性的数据
      onlyTableData: [],
      //添加参数对话框
      addDialogVisiable: false,
      //添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      //添加表单的验证规则对象
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      //编辑表单的验证对象
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      //修改表单的数据对象
      editForm: {},
      //修改对话框的显示与隐藏
      editDialogVisiable: false,
      //控制按钮和文本框的切换和显示
      inputVisible: false,
      //文本框中输入的内容
      inputValue: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择框选择项变化触发函数
    async handleChange() {
      console.log(this.selectedCateKeys)
      this.getParamsData()
    },
    //Tab页签点击事件的处理函数
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    //获取参数列表数据的请求
    async getParamsData() {
      //如果不是选的三级分类，清空选中的数组
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return
      }
      //选中的是三级分类
      //根据所选ID和当前所处面板，获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //控制文本框的显示与隐藏
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') this.manyTableData = res.data
      this.onlyTableData = res.data
    },
    //监听对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //确认对话框
    addParams() {
      //对表单进行一个预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.info('请按规则填写表单')
        else {
          const { data: res } = await this.$http.post(`categories/${this.cateID}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) return this.$message.error('添加参数失败')
          this.$message.success('添加参数成功')
          this.addDialogVisiable = false
          this.getParamsData()
        }
      })
    },
    //修改按钮
    async editAttributes(attr_id) {
      //查询当前参数的信息
      const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes/${attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数信息失败')
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisiable = true
    },
    //编辑对话框重置表单的操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //确定修改按钮的提交
    editParams() {
      //对表单进行一个预校验
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.info('请按规则填写表单')
        else {
          const { data: res } = await this.$http.put(`categories/${this.cateID}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) return this.$message.error('添加参数失败')
          this.$message.success('添加参数成功')
          this.editDialogVisiable = false
          this.getParamsData()
        }
      })
    },
    //根据ID删除对应的参数项
    async removeParams(attr_id) {
      const result = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') return this.$message.info('取消了删除')
      //发起删除请求
      const { data: res } = await this.$http.delete(`categories/${this.cateID}/attributes/${attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    //文本框失去焦点或摁下Enter都会触发
    async handleInputConfirm(row) {
      console.log('ok')
      if (row.inputValue.trim().length === 0) {
        ;(row.inputValue = ''), (row.inputVisible = false)
        return
      }
      //如果没有return，则证明输入的内容，需要做后续的处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      //需要发起请求，保存这次的操作
      this.saveAttrVals(row)
    },
    //点击按钮展示文本输入框
    showInput(row) {
      row.inputVisible = true
      //文本框自动获取焦点
      //$nextTick方法的作用，就是当页面上的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      //需要发起请求，保存这次的操作
      const { data: res } = await this.$http.put(`categories/${this.cateID}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改参数项失败')
      this.$message.success('修改参数项成功')
    },
    //tag标签的删除
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    //如果按钮需要被禁用，返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    //当前选中三级分类的ID
    cateID() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      } else return null
    },
    //动态计算标题文本
    dialogText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.input-new-tag {
  width: 120px;
}
.button-new-tag {
  margin-left: 10px;
}
</style>

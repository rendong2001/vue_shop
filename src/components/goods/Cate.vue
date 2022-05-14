<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row>
        <el-button type="primary" round @click="showAddDialog">添加分类</el-button>
      </el-row>
      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <div>
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
            <i class="el-icon-error" v-else style="color: lightred"></i>
          </div>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <div>
            <!-- 一二三级标签 -->
            <el-tag size="mini" type="danger" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag size="mini" type="primary" v-else>三级</el-tag>
          </div>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <div>
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
          </div>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 8, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisiable" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:" prop="username">
          <el-cascader :options="parentCateList" :props="cascaderProps" clearable v-model="selecedKeys" @change="parentCateChanged" change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3, //层级数，默认三层吧，也不修改了
        pagenum: 1, //当前页码值，默认为1
        pagesize: 8 //每页展示条数，默认为5
      }, //查询参数
      cateList: [], //商品分类的数据列表，默认为空
      total: 0, //总的数据条数
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          type: 'template', //将当前列定义为模板列
          template: 'isok' //当前列使用的模板名称
        },
        {
          label: '排序',
          type: 'template', //将当前列定义为模板列
          template: 'order' //当前列使用的模板名称
        },
        {
          label: '操作',
          type: 'template', //将当前列定义为模板列
          template: 'opt' //当前列使用的模板名称
        }
      ], //为tabble指定列的定义
      addDialogVisiable: false, //添加分类的对话框
      addCateForm: {
        cat_name: '', //将要添加的商品分类名称
        cat_pid: 0, //分类的父id
        cat_level: 0 //分类等级，默认一级分类
      }, //添加分类的表单数据对象
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', tragger: blur }]
      }, //添加分类表单的数据验证规则对象
      parentCateList: [], //父级分类的数据列表
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      }, //指定级联选择器的配置对象
      selecedKeys: [] //选中的父级分类数组
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类的数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('/categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('请求商品分类数据列表失败')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    //pagenum变化
    handleCurrentChange(newNum) {
      console.log(newNum)
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    //pagesize变化
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.queryInfo.pagenum = 1
      this.getCateList()
    },
    //分类对话框的显示与隐藏
    showAddDialog() {
      //先获取父级分类的数据列表
      this.getParentCateList()
      this.addDialogVisiable = true
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败')
      // console.log(res.data)
      this.parentCateList = res.data
    },
    //选择项发生变化触发
    parentCateChanged() {
      console.log(this.selecedKeys)
      //如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      //反之，就没有选中任何的父级分类
      if (this.selecedKeys.length > 0) {
        //父级分类的ID
        this.addCateForm.cat_pid = this.selecedKeys[this.selecedKeys.length - 1]
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selecedKeys.length
        return
      } else {
        //父级分类的ID
        this.addCateForm.cat_pid = 0
        //为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    //点击按钮，添加新的分类
    addCate() {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/categories', this.addCateForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败!')
        this.$message.success('添加分类成功!')
        this.getCateList()
        this.addDialogVisiable = false
      })
    },
    //监听对话框关闭，重置
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selecedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>

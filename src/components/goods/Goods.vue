<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索框区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5"><el-button type="primary" round @click="goAddPage">添加商品</el-button></el-col>
      </el-row>
      <!-- Table表格区域 -->
      <el-table :data="goodsList" border style="width: 100%">
        <el-table-column type="index" :index="continueIndex" label="#"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"> </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="95px"> </el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="200px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <div>
              <el-button size="mini" type="primary" @click="" icon="el-icon-edit"></el-button>
              <el-button size="mini" type="danger" @click="removeById(scope.row.goods_id)" icon="el-icon-delete"></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 8, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
    <!-- 修改商品的对话框 -->
    <el-dialog title="修改商品信息" :visible.sync="editDialogVisiable" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="110px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="商品价格(元)" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsInfo(editForm)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //商品价格校验规则
    const validatePrice = (rule, value, cb) => {
      const regPrice = /^\d+$|^\d+[.]?\d+$/
      if (regPrice.test(value)) {
        return cb()
      }
      cb(new Error('商品价格只能是数字'))
    }
    //商品重量校验规则
    const validateWeight = (rule, value, cb) => {
      const regWeight = /^\d+$|^\d+[.]?\d+$/
      if (regWeight.test(value)) {
        return cb()
      }
      cb(new Error('商品重量只能是数字'))
    }
    return {
      //查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //商品列表
      goodsList: [],
      //商品总条目数
      total: 0,
      //修改对话框的显示与隐藏
      editDialogVisiable: false,
      //根据商品ID查询到的商品信息对象
      editForm: {},
      //编辑商品信息的验证规则对象
      editFormRules: {
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: validatePrice, trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { validator: validateWeight, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    //根据分页获取相应的数据列表
    this.getGoodsList()
  },
  methods: {
    getGoodsList() {
      this.$http.get('/goods', { params: this.queryInfo }).then(res => {
        console.log(res)
        if (res.data.meta.status !== 200) return this.$message.error('获取商品列表失败')
        this.goodsList = res.data.data.goods
        this.total = res.data.data.total
        console.log(this.goodsList)
        this.$message.success('获取商品列表成功')
      })
    },
    //分页
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //分页
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    //分页索引持续增加
    continueIndex(index) {
      return index + 1 + (this.queryInfo.pagenum - 1) * this.queryInfo.pagesize
    },
    //编辑对话框的展示与隐藏【接口有错误，先不整了】
    async showEditDialog(id) {
      //根据商品ID进行查询商品信息
      // console.log(id)
      const { data: res } = await this.$http.get('/goods/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品信息失败')
      }
      this.editForm = res.data
      console.log(this.editForm)
      this.editDialogVisiable = true
    },
    //编辑商品的确定按钮提交【接口有错误，先不整了】
    editGoodsInfo(editForm) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //发起修改商品信息的请求
        const { data: res } = await this.$http.put('/goods/' + editForm.goods_id, {
          goods_name: editForm.goods_name,
          goods_price: Number(editForm.goods_price),
          goods_number: Number(editForm.goods_number),
          goods_weight: Number(editForm.goods_weight)
        })
        console.log(res)
      })
    },
    //删除商品事件
    async removeById(id) {
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
      const { data: res } = await this.$http.delete('/goods/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败')
      //刷新请求数据
      this.getGoodsList()
      //消息提示刷新
      this.$message.success('删除用户成功')
    },
    //编辑表单对话框关闭，重置表单数据【接口有错误，先不整了】
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //跳转到添加商品界面
    goAddPage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped></style>

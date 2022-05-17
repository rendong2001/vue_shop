<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索框区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList()">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList()"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- Table表格区域 -->
      <el-table :data="orderList" border style="width: 100%">
        <el-table-column type="index" :index="continueIndex" label="#"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="95px"> </el-table-column>
        <el-table-column prop="pay_status" label="是否付款" width="95px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="95px"> </el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <div>
              <el-button size="mini" type="primary" @click="showDialog" icon="el-icon-edit"></el-button>
              <el-button size="mini" type="success" @click="showProgressBox" icon="el-icon-location"></el-button>
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
    <!-- 修改地址的对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisiable" width="50%" @close="dialogClose">
      <el-form :model="addressForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.address1" :options="cityData" :props="cityProps" @change="handleChange" clearable></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisiable = false">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 物流位置的对话框 -->
    <el-dialog title="物流进程" :visible.sync="progressVisiable" width="50%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
import progressInfo from './progress.js'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagesize: 10,
        pagenum: 1
      },
      total: 0,
      orderList: [],
      editDialogVisiable: false,
      addressForm: {
        address1: '',
        address2: ''
      },
      editFormRules: {
        address1: [{ required: true, message: '请选择地址', trigger: 'blur' }],
        address2: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
      },
      cityProps: {
        expandTrigger: 'hover'
      },
      cityData: cityData,
      progressVisiable: false,
      //物流进程数据
      progressInfo: progressInfo
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('/orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      // console.log(res)
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(this.orderList)
    },
    //分页
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.queryInfo.pagenum = 1
      this.getOrderList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    //索引持续增长
    continueIndex(index) {
      return index + 1 + this.queryInfo.pagesize * (this.queryInfo.pagenum - 1)
    },
    //对话框关闭事件，重置表单数据
    dialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    //编辑对话框的显示与隐藏
    showDialog() {
      this.editDialogVisiable = true
    },
    handleChange() {},
    //展示物流进程的对话框【接口出错用不了，暂时不写】
    //把接口文档中请求成功的数据，copy一份，存起来，像citydata.js那样操作
    async showProgressBox() {
      // // 供测试的物流单号：1106975712662
      // const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流进度失败!')
      // }
      // this.progressInfo = res.data
      console.log(this.progressInfo)
      this.progressVisiable = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>

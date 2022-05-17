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
      <!-- 警告区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :active="Number(activeIndex)" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- Tab标签栏区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择框 -->
              <el-cascader v-model="addForm.goods_cat" :props="cateProps" :options="cateList" @change="handleChange" clearable></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的API地址 -->
            <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本 -->
            <quill-editor v-model="addForm.goods_introduce" ref="myQuillEditorRef"> </quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览的对话框 -->
    <el-dialog title="图片预览" :visible.sync="dialogVisible" width="40%">
      <el-image style="width: 100%; height: 100%" :src="previewUrl" fit="contain"></el-image>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      //添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 1,
        goods_number: 1,
        goods_weight: 100,
        //商品所属的分类数组(存放的是级联选择器配置对象中的value)
        goods_cat: [],
        //上传图片的临时路径
        pics: [],
        //商品的内容详情描述
        goods_introduce: '',
        //商品的参数（包括动态参数和静态属性）
        attrs: []
      },
      //添加商品表单的验证规则对象
      addFormRules: {
        goods_name: [{ required: true, message: '请填写商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请填写商品价格', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请填写商品数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请填写商品重量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      //商品分类数据列表(一级大分类)
      cateList: [],
      //级联选择器的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //动态参数列表数据
      manyTableData: [],
      //静态属性列表数据
      onlyTableData: [],
      //up-load组件上传图片的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //图片预览的对话框
      dialogVisible: false,
      //图片预览的Url
      previewUrl: ''
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    //三级分类的ID
    cateID() {
      if (this.addForm.goods_cat.length === 3) return this.addForm.goods_cat[2]
      return null
    }
  },
  methods: {
    //获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
      this.cateList = res.data
      console.log(this.cateList)
    },
    //级联选择器选中项，变化触发
    handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    //Tabs标签页发生切换前触发的钩子
    beforeTabLeave(activeName, oldActiveName) {
      console.log(activeName, oldActiveName)
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    //Tabs发生切换点击触发的函数
    async tabClicked() {
      console.log(this.activeIndex)
      //根据activeIndex的值，判断点击了哪个Tabs标签页
      switch (this.activeIndex) {
        case '1': {
          console.log('动态参数')
          const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: { sel: 'many' } })
          if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败')
          // console.log(res.data)
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
          console.log(this.manyTableData)
          break
        }
        case '2': {
          console.log('静态属性')
          const { data: res } = await this.$http.get(`categories/${this.cateID}/attributes`, { params: { sel: 'only' } })
          if (res.meta.status !== 200) return this.$message.error('获取静态属性列表失败')
          // console.log(res.data)
          // 静态属性就不需要分隔成数组了
          // res.data.forEach(item => {
          //   item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          // })
          this.onlyTableData = res.data
          console.log(this.onlyTableData)
          break
        }
        case '3': {
          console.log('商品图片')
          break
        }
        case '4': {
          console.log('商品内容')
          break
        }
      }
    },
    //上传图片的预览事件
    handlePreview(file) {
      console.log(file)
      this.previewUrl = file.response.data.url
      this.dialogVisible = true
    },
    //处理移除图片的操作
    handleRemove(file) {
      //1、获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      //2、从pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      //3、调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(i, 1)
    },
    //图片上传成功的钩子函数
    handleSuccess(response) {
      console.log(response)
      //1、拼接得到一个图片的信息对象
      const picInfo = { pic: response.data.tmp_path }
      //2、将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo)
    },
    //添加商品
    add() {
      console.log(this.addForm.goods_introduce)
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项目')
        //执行添加的业务逻辑
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        //处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        //处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        //发起添加商品的请求
        //商品的名称必须是唯一的
        const { data: res } = await this.$http.post('/goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.el-button {
  margin-top: 10px;
}
</style>

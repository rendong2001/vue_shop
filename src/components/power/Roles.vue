<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row>
        <el-button type="success" round>添加角色</el-button>
      </el-row>
      <el-table :data="rolesList" border style="width: 100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 栅格系统的布局 -->
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable type="danger" @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 渲染嵌套二级权限 -->
                <el-row :class="['bdbottom', i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag closable type="success" @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag v-for="(item3, i3) in item2.children" :key="item3.id" closable type="" @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{ scope.row }}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="small" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="small" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="small" type="warning" icon="el-icon-setting" @click="showSeRighttDialog(scope.row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisiable" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件 -->
      <el-tree :data="rightsList" :props="treeProps" ref="treeRef" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [], //角色列表
      roleId: '', // 即将 分配角色的ID
      setRightDialogVisiable: false, //分配权限对话框
      rightsList: [], //权限数据列表
      treeProps: {
        label: 'authName',
        children: 'children'
      }, //树形控件的属性绑定对象
      defKeys: [] //默认选中结点Id值数组
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      console.log(res)
      this.rolesList = res.data
    },
    //根据ID删除对应的权限
    async removeRightById(role, rightId) {
      //弹框提示是否删除
      const res = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => {
        return err
      })
      // console.log(res)
      //发起删除权限的请求
      if (res === 'confirm') {
        const { data: res } = await this.$http.delete(`/roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) return this.$message.error('删除权限失败')
        role.children = res.data
        this.$message.success('删除权限成功')
      } else return this.$message.info('取消了删除')
    },
    //展示分配权限对话框
    async showSeRighttDialog(role) {
      //获取所有权限列表
      const { data: res } = await this.$http.get('/rights/tree')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败')
      this.rightsList = res.data
      //存放角色的roleID
      this.roleId = role.id
      //递归获取三级结点的ID
      this.getLeafKeys(role, this.defKeys)
      console.log(this.defKeys)
      this.setRightDialogVisiable = true
    },
    //通过递归的形式，获取角色下所有三级权限的ID,并保存到数组defKeys中
    getLeafKeys(node, arr) {
      //如果当前node结点不包含Children属性，则是三级结点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    //对话框关闭，清空数组
    setRightDialogClosed() {
      this.defKeys = []
    },
    //分配权限对话框确定，分配权限
    async allotRight() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      console.log(keys)
      const idStr = keys.join(',')
      //已选结点ID的字符串
      console.log(idStr)
      const { data: res } = await this.$http.post(`/roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisiable = false
    }
  }
}
</script>

<style lang="less" scoped>
.vcenter {
  display: flex;
  align-items: center;
}
</style>

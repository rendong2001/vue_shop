1、路由重定向到‘/login’页面

2、html、body、外层div占满全屏

3、页面上移动除了margin、position:absolute 也是可以的，不行再加上transform嘛

4、:model 和 v-model有啥区别

5、对axios进行全局配置（可以再进行设置一下请求的根路径）

5、配置全局导航守卫（前置）

6、通过axios请求拦截器，添加token，保证能够请求有权限的接口
7、letter-spacing: 貌似是设置字体之间的间距的

8、collapse  是否水平折叠收起菜单（仅在 mode 为 vertical 时可用）

```javascript
collapse='true'		//这样只是接受了一个字符串
:collapse='true'	//加上绑定才是接受一个布尔值
```

```javascript
:width="isCollapse ? '64px' : '200px'"		//折叠菜单栏宽度变化，很jb方便的
```

9、<el-menu></el-menu>的router参数，是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转，可以对其进行适当的改造

10、激活菜单的颜色：<el-menu></el-menu>的default-active参数，可以将url路径保存到sessionStorage中window.sessionStorage.setItem('','')

11、组件之间的距离可以使用栅格来进行控制  <el-row></el-row> <el-col><el-col>很是jb方便

12、返回的promise对象可以用async和await来优化这次异步操作，用await就会得到一个数据对象，从而可以从数据对象身上解构赋值出一个属性 

13、<el-tabel>中通过element-ui中作用域插槽来获取本行（当前对象）的数据

```javascript
<template slot-scope="scope">
    <div>
      {{ scope.row }}
    </div>
</template>
```

14、一般在created()函数中，调用发起获取页面请求数据的方法，这样在完成分页，改变页码值的之后重新调用methods结点中的方法就可以了

15、根据数值，按需展示某些标签，可以用v-if,v-else

16、看一下<pre>标签

17、element ui中弹框中，点击取消需要一个异常处理如下

```javascript
const res = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => {
                return err
            })
```

18、element-ui中级联选择框中 props属性，是级联选择框的配置对象

16、根据数值，按需赋予标签属性值，可以用计算属性。

​		computed中要写成函数的形式，尽管是函数，但返回的是属性值

17、标签中动态的属性值，都应该定义成动态属性

18、对于拿到的时间数据，可以创建一个全局时间过滤器来格式拿到的时间数据

```javascript
//定义处理时间格式的过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  // return `yyyy-mm-dd hh:mm:ss`
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
```

19、element-ui中<el-upload>上传控件发起ajax请求的时候，没有用到咱们自己配置的axios，所以上传到有权限的接口时，会报错到：“无效的token”。

<el-upload>是用它自己内部封装的一套ajax请求，它自己封装的ajax是没有携带Authorization请求头的。

解决：<el-upload>有属性 headers  设置上传的请求头部

```javascript
<el-upload :headers="headerObj"></el-upload>
headerObj: {
    Authorization: window.sessionStorage.getItem('token')
}
```

20、富文本用的还是 vue-quill-editor（看文档，很简单）

21、深拷贝（就是把原有的复制出一份新的，这样对新的进行相关操作的时候，不会影响原有的）

```javascript
loadsh  cloneDeep(obj)
```

22、对象的合并就要用到loadsh

```
import _ from 'lodash'	//loadsh导入
```

23、从装babel插件（优化上线项目时，console.log()的打印）开始，build失败。【后期项目优化没做处理】

————————————————————————————————————————————

评论总结：

phpstudy和自己装的mysql是有冲突的（自己的mysql端口号是3306，phpstudy也是3306，端口号冲突）sql文件导入不进去的不要在phpstudy里边导入了，如果学过mysql，可以自己新建一个mydb数据库，然后在vue_api_server里面的config文件里修改登录密码为自己的mysql密码就行，之后照着老师的操作进行就可以了。其实就只是要读取那个mydb.sql文件。


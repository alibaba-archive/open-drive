<template>
<v-container fluid grid-list-sm class="pa-0">
  <v-layout row>
    <v-flex xs12>


      <v-card>
        <v-toolbar dense flat>
          <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->
          <v-btn small icon :to="{name:'Users'}"><v-icon>arrow_back</v-icon></v-btn>
          <v-avatar size="30"><img v-if="user && user.avatar_url" :src="endpoint+user.avatar_url"/></v-avatar>
          <v-toolbar-title>

            {{user?user.nick_name:''}}的云盘列表 ({{searchResult.length}})

          </v-toolbar-title>
          <v-spacer></v-spacer>

          <v-text-field class="hidden-sm-and-down" v-model.trim="sch.txt" placeholder="按名称前缀模糊查询" prepend-icon="search" :append-icon="sch.txt?'close':''"
          @click:append="()=>(sch.txt='')"></v-text-field>

          <!-- <v-btn icon color="success" @click.stop="showAdd">
            <v-icon>add</v-icon>
          </v-btn> -->

        </v-toolbar>


        <v-toolbar class="hidden-md-and-up" dense flat>
          <v-text-field  v-model.trim="sch.txt" placeholder="按名称前缀模糊查询" prepend-icon="search" :append-icon="sch.txt?'close':''"
             @click:append="()=>(sch.txt='')"></v-text-field>
        </v-toolbar>

        <v-card-text style="overflow:auto" class="pa-1">
          <table class="v-datatable v-table theme--light hidden-sm-and-down">
            <thead class="text-xs-left">
              <tr>
                <th>-</th>
                <th>名称/容量</th>
                <th>描述</th>

                <th>创建时间</th>
                <th class="text-xs-center">操作</th>
              </tr>
            </thead>
            <tbody v-if="searchResult.length>0">
              <tr :class="item.status=='disabled'?'red lighten-4':''" v-for="(item,$index) in searchResult" :key="item.name">
                <td>{{$index+1}}.</td>

                <td :class="item.status=='disabled'?'disabled-item-name':''">
                  <DriveIcon/>
                  {{item.drive_name}}
                  <div>

                  <small class="info--text">(
                  <span v-if="item.total_size>0">{{F.sizeFormat(item.used_size)}}/{{F.sizeFormat(item.total_size)}}</span>
                  <span v-else>不限制容量</span>
                  )</small>

                </div>
                </td>

                <td>
                  <div class="truncate grey--text" style="max-width:160px;vertical-align:top">{{item.description||'&nbsp;'}}</div>
                  
                </td>


                <td>{{F.timeFormat(item.created_at)}}<br/>
                  <small class="grey--text darken-4">({{F.fromNow(item.created_at)}})</small>
                </td>
                <td class="text-xs-center op-btns">

                  <div style="width:180px;margin:auto">

                  <v-tooltip top>详情
                    <v-btn class="ma-0" slot="activator" color="info"
                     icon flat @click.prevent.stop="showDetails(item, $index)">
                      <v-icon>details</v-icon>
                    </v-btn>
                  </v-tooltip>


                  <v-tooltip top>已被禁用，点击启用
                    <v-btn class="ma-0" slot="activator" v-if="userInfo && userInfo.privilege!='readonly' && item.status=='disabled'" icon flat color="error" @click.prevent.stop="changeStatus(item, $index)">
                      <v-icon>fa-toggle-off</v-icon>
                    </v-btn>
                  </v-tooltip>

                  <v-tooltip top>已经启用，点击禁用
                    <v-btn class="ma-0" slot="activator" v-if="userInfo && userInfo.privilege!='readonly' && item.status=='enabled'" icon flat color="success" @click.prevent.stop="changeStatus(item, $index)">
                      <v-icon>fa-toggle-on</v-icon>
                    </v-btn>
                  </v-tooltip>

                   <v-tooltip top>删除
                    <v-btn class="ma-0" slot="activator" v-if="userInfo && userInfo.privilege!='readonly'" icon flat color="error" @click.prevent.stop="showDelete(item, $index)">
                      <v-icon>close</v-icon>
                    </v-btn>
                  </v-tooltip>

                  <v-tooltip top>进入
                    <v-btn class="ma-0" slot="activator" v-if="userInfo && userInfo.privilege!='readonly'" icon flat color="blue" @click.prevent.stop="goIn(item, $index)">
                      <v-icon>forward</v-icon>
                    </v-btn>
                  </v-tooltip>
                </div>
                </td>

              </tr>
            </tbody>
          </table>


          <!-- mobile view -->
          <v-list class="hidden-md-and-up pa-0">
            <template v-for="(item,$index) in searchResult">
              <v-list-tile
               :key="item.drive_id"
                avatar
                ripple
                :class="item.status=='disabled'?'red lighten-4':''"
              >
                <v-list-tile-avatar>
                  <DriveIcon/>
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title :class="item.status=='disabled'?'disabled-item-name':''">

                    {{ item.drive_name }}
                  </v-list-tile-title>

                  <v-list-tile-sub-title class="grey--text">
                    (<span v-if="item.total_size>0">{{F.sizeFormat(item.used_size)}}/{{F.sizeFormat(item.total_size)}}</span>
                    <span v-else>不限制容量</span>)
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>


                  <v-menu offset-y right>
                    <v-btn slot="activator" icon><v-icon>more_vert</v-icon></v-btn>
                    <v-list>
                      <v-list-tile @click="showDetails(item, $index)" color="info">
                        <v-list-tile-title><v-icon color="info">details</v-icon> 详情</v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile @click="goIn(item, $index)" color="info">
                        <v-list-tile-title><v-icon class="info--text">forward</v-icon> 进入</v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile @click="changeStatus(item, $index)" v-if="userInfo && userInfo.privilege!='readonly' && item.status=='disabled'">
                        <v-list-tile-title><v-icon>fa-toggle-off</v-icon> 已被禁用，点击启用</v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile @click="changeStatus(item, $index)" color="success"  v-if="userInfo && userInfo.privilege!='readonly' && item.status!='disabled'" >
                        <v-list-tile-title><v-icon color="success" >fa-toggle-on</v-icon> 已经启用，点击禁用</v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile @click="showDelete(item, $index)" color="error">
                        <v-list-tile-title><v-icon class="error--text">close</v-icon> 删除</v-list-tile-title>
                      </v-list-tile>
                    </v-list>
                  </v-menu>


                </v-list-tile-action>

              </v-list-tile>
              <v-divider v-if="$index + 1 < searchResult.length" :key="$index"></v-divider>

            </template>
          </v-list>


          <Loading v-if="loading"></Loading>
          <Nodata v-if="!loading && searchResult.length==0"></Nodata>

        </v-card-text>

      </v-card>
    </v-flex>
  </v-layout>

  <UserDriveDetailDialog></UserDriveDetailDialog>
</v-container>
</template>

<script>
import UserDriveDetailDialog from './UserDriveDetailDialog'
import Users from '@/services/users.js'
import Drives from '@/services/drives.js'
import F from '@/services/f.js'
var tid;

export default {
  components: {
    UserDriveDetailDialog
  },
  data() {
    return {
      F,
      endpoint: Global.endpoint,
      offset: 0,

      loading: false,
      loading2: false,

      sch: {
        txt: ''
      },
      searchResult: [],
      keepItems: [],
      user: null,
      userId: ''
    }
  },
  computed: {
    userInfo() {
      return this.$root.userInfo
    }
  },
  watch: {
    'sch.txt'(){
      clearTimeout(tid);
      tid=setTimeout(()=>{
        this.search()
      },1000)
    }
  },
  async mounted() {
    this.userId = this.$route.params.userId;
    this.getUserInfo();
    this.refresh()
  },
  methods: {
    async getUserInfo(){
      var info = await Users.get(this.userId)
      this.user = info;
    },
    async refresh(){
      this.loading=true;

      this.searchResult=[];
      this.keepItems=[];

      this.loading=true;

      var arr = await Drives.listAll(this.userId)

      this.searchResult = clone(arr)
      this.keepItems = clone(arr)

      this.loading=false;
    },

    search(){
      var arr = JSON.parse(JSON.stringify(this.keepItems||[]));
      if(!this.sch.txt){
        this.searchResult = arr;
        return;
      }
      var v= this.sch.txt;

      var t=[];
      arr.forEach(n=>{
        if(n.drive_name.toLowerCase().indexOf(v)!=-1
        || n.drive_id.toLowerCase().indexOf(v)!=-1){
          t.push(n)
        }
      })
      this.searchResult = t;
    },



    showDetails(item, $index){
      this.$root.$emit('show::UserDriveDetailDialog', {
        item: item
      })
    },
    async changeStatus(item, $index){
      var b = await Dialog.confirm('<span class="error--text">修改云盘状态</span>',
            `确定${item.status=='enabled'?'禁用':'启用'}此云盘: <b>${item.drive_name}</b>?`)
      if(!b)return;

      Toast.info('正在修改...')
      try{
        await Drives.put(this.userId, item.drive_id, {
          status: item.status == "enabled" ? "disabled" : "enabled"
        })
      }catch(e){
        return ;
      } finally {
        this.refresh();
      }
      Toast.success('修改成功')
    },
    async showDelete(item, $index){
      var b = await Dialog.confirm('<span class="error--text">删除云盘</span>',
            `确定删除云盘: <b>${item.drive_name}</b>?`)
      if(!b)return;

      Toast.info('正在删除...')

      await Drives.del(this.userId, item.drive_id)


      // try{
      //   await Drives.del(this.userId, item.drive_id)
      // }catch(e){
      //   if(e.data.code=='NotEmpty'){

      //     await delay(600);
      //     var b = await Dialog.confirm('<span class="error--text">强制删除云盘</span>',
      //           `强制删除云盘将删除所有关联的共享目录，确定强制删除云盘: <b>${item.drive_name}</b>?`)
      //     if(!b)return;

      //     Toast.info('正在强制删除...')
      //     try{
      //       await Drives.del(this.userId, item.drive_id, true)
      //     }catch(e){
      //       return;
      //     }

      //   }else return;
      // }

      Toast.success('删除云盘成功')

      this.searchResult.splice($index, 1)
      //this.folders.splice(this.folders.indexOf(item),1)
    },
    goIn(item){
       this.$router.push({name:'UserDrive', params: {userId: this.userId, driveId: item.drive_id}})
    }
  }
}
</script>

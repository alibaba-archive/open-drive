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

            {{user?user.nick_name:''}}的共享文件夹列表 ({{searchResult.length}})

          </v-toolbar-title>
          <v-spacer></v-spacer>

          <v-text-field class="hidden-sm-and-down" v-model.trim="sch.txt" placeholder="按名称前缀模糊查询" prepend-icon="search" :append-icon="sch.txt?'close':''"
          @click:append="()=>(sch.txt='')"></v-text-field>


        </v-toolbar>

        <v-toolbar class="hidden-md-and-up" dense flat>
          <v-text-field  v-model.trim="sch.txt" placeholder="按名称前缀模糊查询" prepend-icon="search" :append-icon="sch.txt?'close':''"
             @click:append="()=>(sch.txt='')"></v-text-field>
        </v-toolbar>

        <v-card-text style="overflow:auto" class="pa-1">
          <table class="v-datatable v-table theme--light  hidden-sm-and-down">
            <thead class="text-xs-left">
              <tr>
                <th>-</th>
                <th>名称/权限</th>
                <th>描述</th>
                <th>有效期</th>
                <th>创建时间</th>
                <th class="text-xs-center">操作</th>
              </tr>
            </thead>
            <tbody v-if="searchResult.length>0">
              <tr :class="item.status=='disabled'?'red lighten-4':''" v-for="(item,$index) in searchResult" :key="item.name">
                <td>{{$index+1}}.</td>

                <td :class="item.status=='disabled'?'disabled-item-name':''">
                  <ShareIcon/>
                  {{item.share_name}}

                  <div :class="F.privilegeFormat(item.privilege,1)+'--text'">{{F.privilegeFormat(item.privilege)}}</div>

                </td>

                <td>
                    <div class="truncate grey--text" style="width:100px;">{{item.description}}</div>

                </td>

                <td>
                  <div v-if="item.expires_time=='Never'">永久</div>
                  <div v-else>{{F.timeFormat(item.expires_time)}}<br/>
                    <small class="grey--text darken-4">({{F.fromNow(item.expires_time,1)}})</small>
                  </div>

                </td>

                <td>{{F.timeFormat(item.created_at)}}<br/>
                  <small class="grey--text darken-4">({{F.fromNow(item.created_at)}})</small>
                </td>
                <td class="text-xs-center op-btns">

                  <div style="width:160px;margin:auto">

                  <v-tooltip top>详情
                    <v-btn class="ma-0" slot="activator" color="info"
                     icon flat @click.prevent.stop="showDetails(item, $index)">
                      <v-icon>details</v-icon>
                    </v-btn>
                  </v-tooltip>

                  <v-tooltip top>进入
                    <v-btn class="ma-0" slot="activator" color="info"
                     icon flat @click.prevent.stop="goIn(item, $index)">
                      <v-icon>forward</v-icon>
                    </v-btn>
                  </v-tooltip>

                  <v-tooltip top>删除
                    <v-btn class="ma-0" slot="activator" v-if="userInfo && userInfo.privilege!='readonly'"
                    icon flat color="error" @click.prevent.stop="showDelete(item, $index)">
                      <v-icon>close</v-icon>
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
               :key="item.share_id"
                avatar
                ripple
                :class="item.status=='disabled'?'red lighten-4':''"
              >
                <v-list-tile-avatar>
                  <ShareIcon/>
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title :class="item.status=='disabled'?'disabled-item-name':''">
                    {{item.share_name}}
                  </v-list-tile-title>

                  <v-list-tile-sub-title class="grey--text">

                    <span :class="F.privilegeFormat(item.privilege,1)+'--text'">{{F.privilegeFormat(item.privilege)}}</span>

                    (<span v-if="item.expires_time=='Never'">永久</span>
                  <span v-else>{{F.timeFormat(item.expires_time)}}
                    <small class="grey--text darken-4">({{F.fromNow(item.expires_time,1)}})</small>
                  </span>)
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>


                  <v-menu offset-y right>
                    <v-btn slot="activator" icon><v-icon>more_vert</v-icon></v-btn>
                    <v-list>
                      <v-list-tile @click="showDetails(item, $index)">
                        <v-list-tile-title><v-icon>details</v-icon> 详情</v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile @click="goIn(item, $index)" color="info">
                        <v-list-tile-title><v-icon class="info--text">forward</v-icon> 进入</v-list-tile-title>
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
import CreateDriveDialog from '../files/CreateDriveDialog'
import UserDriveDetailDialog from './UserDriveDetailDialog'
import Users from '@/services/users.js'
import Shares from '@/services/shares.js'
import F from '@/services/f.js'
var tid;

export default {
  components: {
    CreateDriveDialog,
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

      var arr = await Shares.listAll(this.userId)

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
        if(n.share_name.toLowerCase().indexOf(v)!=-1
        || n.share_id.toLowerCase().indexOf(v)!=-1){
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
    async showDelete(item, $index){
      var b = await Dialog.confirm('<span class="error--text">删除共享文件夹</span>',
            `确定删除共享文件夹: <b>${item.share_name}</b>?`)
      if(!b)return;

      Toast.info('正在删除...')
      await Shares.del(this.userId, item.share_id)
      Toast.success('删除共享文件夹成功')
      this.searchResult.splice($index, 1)
      //this.folders.splice(this.folders.indexOf(item),1)
    },
    goIn(item){
       this.$router.push({name:'UserShare', params: {userId: this.userId, shareId: item.share_id}})
    }
  }
}
</script>

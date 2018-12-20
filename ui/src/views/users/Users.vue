<template>
<v-container fluid grid-list-sm class="pa-0">
  <v-layout row>
    <v-flex xs12>


      <v-card>
        <v-toolbar dense flat>
          <v-icon>people</v-icon>
          <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->
          <v-toolbar-title>用户列表 ({{searchResult.length}}<span v-if="nextMarker">+</span>)</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-text-field class="hidden-sm-and-down" v-model.trim="sch.txt" placeholder="按用户ID精确查询" prepend-icon="search" :append-icon="sch.txt?'close':''" @click:append="()=>(sch.txt='')"></v-text-field>
          <!-- <v-btn icon @click.stop="search"></v-btn> -->

        </v-toolbar>

        <v-toolbar class="hidden-md-and-up" dense flat>
          <v-text-field v-model.trim="sch.txt" placeholder="按用户ID精确查询" prepend-icon="search" :append-icon="sch.txt?'close':''" @click:append="()=>(sch.txt='')"></v-text-field>
        </v-toolbar>

        <v-card-text style="overflow:auto" class="pa-1">
          <table class="v-datatable v-table theme--light hidden-sm-and-down">
            <thead class="text-xs-left">
              <tr>
                <th>-</th>
                <th>头像</th>
                <th>昵称/用户Id</th>
                <th>类型/描述</th>
                <th>最后修改</th>
                <th class="text-xs-center">操作</th>
              </tr>
            </thead>
            <tbody v-if="searchResult.length>0">
              <tr :class="item.status=='disabled'?'red lighten-4':''" v-for="(item,$index) in searchResult" :key="item.user_id">
                <td>{{$index+1}}.</td>
                <td>
                  <v-avatar size="30"><img v-if="item.avatar_url" :src="item.avatar_url.startsWith('http') ? item.avatar_url : endpoint+item.avatar_url" /></v-avatar>
                </td>

                <td :class="item.status=='disabled'?'disabled-item-name':''">
                  {{item.nick_name}}
                  <small :class="F.privilegeFormat(item.privilege,1)+'--text'" v-if="item.is_admin">(管理员:{{F.privilegeFormat(item.privilege)}})</small>
                  <br/>
                  <span class="grey--text darken-4">{{item.user_id}}</span>
                </td>

                <td>
                  {{item.user_type}}
                  <div class="truncate" style="width:100px;">
                    <a v-if="userInfo && userInfo.privilege!='readonly'" class="fa fa-edit" href="" @click.prevent.stop="showEditDesc(item)"></a>
                    <v-tooltip top>{{item.description}}
                      <span slot="activator">{{item.description}}</span>
                    </v-tooltip>
                  </div>
                </td>
                <td>{{F.timeFormat(item.updated_at)}}<br/>
                  <small class="grey--text darken-4">({{F.fromNow(item.updated_at)}})</small>
                </td>
                <td  class="pa-0 text-xs-center op-btns">
                 <div style="min-width:220px">
                  <v-tooltip top>{{item.is_admin?'已经是管理员':'设为管理员'}}
                    <v-btn class="ma-0" slot="activator" v-if="userInfo && userInfo.privilege=='grantable'" icon flat color="purple" :disabled="item.is_admin" @click.prevent.stop="addUserToAdmins(item)">
                      <v-icon>person_add</v-icon>
                    </v-btn>
                  </v-tooltip>

                  <v-tooltip top>已被禁用，点击恢复启用
                    <v-btn class="ma-0" slot="activator" v-if="userInfo && userInfo.privilege!='readonly' && item.status=='disabled'" icon flat color="error" @click.prevent.stop="updateUserStatus(item,'enabled')">
                      <v-icon>fa-toggle-off</v-icon>
                    </v-btn>
                  </v-tooltip>

                  <v-tooltip top>已经启用，点击禁用（禁用后该用户无法登录）
                    <v-btn class="ma-0" slot="activator" v-if="userInfo && userInfo.privilege!='readonly' && item.status!='disabled'" icon flat color="success" @click.prevent.stop="updateUserStatus(item,'disabled')">
                      <v-icon>fa-toggle-on</v-icon>
                    </v-btn>
                  </v-tooltip>

                  <v-tooltip top>查看云盘列表
                    <v-btn class="ma-0" slot="activator" icon flat color="info" :to="{name:'UserDrives',params:{userId: item.user_id}}">
                      <DriveIcon/>
                    </v-btn>
                  </v-tooltip>

                  <v-tooltip top>查看共享文件夹列表
                    <v-btn class="ma-0" slot="activator" icon flat color="info" :to="{name:'UserShares',params:{userId: item.user_id}}">
                      <ShareIcon/>
                    </v-btn>
                  </v-tooltip>

                  <v-tooltip top>删除
                    <v-btn class="ma-0" slot="activator" v-if="userInfo && userInfo.privilege!='readonly'" icon flat color="error" @click.prevent.stop="delUser(item, $index)">
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
            <template v-for="(item,$index) in searchResult" >
              <v-list-tile
              :key="item.user_id"
                avatar
                ripple
              >
                 <v-list-tile-avatar size="30">
                    <img v-if="item.avatar_url" :src="item.avatar_url.startsWith('http') ? item.avatar_url : endpoint+item.avatar_url" />
                  </v-list-tile-avatar>

                <v-list-tile-content>


                  <v-list-tile-title :class="item.status=='disabled'?'disabled-item-name':''">{{ item.nick_name }}
                    <small :class="F.privilegeFormat(item.privilege,1)+'--text'" v-if="item.is_admin">(管理员:{{F.privilegeFormat(item.privilege)}})</small>
                  </v-list-tile-title>
                  <v-list-tile-sub-title class="grey--text">{{ item.user_id }}</v-list-tile-sub-title>

                </v-list-tile-content>

                <v-list-tile-action v-if="userInfo && userInfo.privilege!='readonly'"  style="min-width:45px">
                  <v-menu offset-y right>
                    <v-btn slot="activator" icon><v-icon>more_vert</v-icon></v-btn>
                    <v-list>
                      <v-list-tile @click="()=>item.is_admin?null:addUserToAdmins(item, $index)" v-if="userInfo && userInfo.privilege=='grantable'" :disabled="item.is_admin">
                        <v-list-tile-title><v-icon>person_add</v-icon> {{item.is_admin?'已经是管理员':'设为管理员'}}</v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile @click="updateUserStatus(item,'enabled')" v-if="userInfo && userInfo.privilege!='readonly' && item.status=='disabled'" >
                        <v-list-tile-title><v-icon>fa-toggle-off</v-icon> 已被禁用，点击恢复启用</v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile @click="updateUserStatus(item,'disabled')" color="success"  v-if="userInfo && userInfo.privilege!='readonly' && item.status!='disabled'" >
                        <v-list-tile-title><v-icon color="success" >fa-toggle-on</v-icon> 已经启用，点击禁用</v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile color="info" :to="{name:'UserDrives',params:{userId: item.user_id}}">
                        <v-list-tile-title>
                           <DriveIcon/> 查看云盘列表</v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile color="info" :to="{name:'UserShares',params:{userId: item.user_id}}">
                        <v-list-tile-title><ShareIcon/> 查看共享文件夹列表</v-list-tile-title>
                      </v-list-tile>
                      <v-list-tile @click="delUser(item, $index)" color="error">
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
          <v-btn color="info" flat block v-if="!loading && nextMarker" @click="search">下一页</v-btn>

        </v-card-text>

      </v-card>
    </v-flex>
  </v-layout>
  <UpdateAdminDialog></UpdateAdminDialog>
  <UserDescriptionDialog></UserDescriptionDialog>
</v-container>
</template>

<script>
import UserDescriptionDialog from './UserDescriptionDialog.vue'
import UpdateAdminDialog from '../admins/UpdateAdminDialog.vue'
import Users from '@/services/users.js'
import Admins from '@/services/admins.js'
import F from '@/services/f.js'
var tid;

export default {
  components: {
    UserDescriptionDialog,
    UpdateAdminDialog
  },
  data() {
    return {
      F,
      endpoint: Global.endpoint,

      loading: false,
      loading2: false,

      sch: {
        txt: '',
        // status: '',
        // userType: ''
      },
      searchResult: [],
      nextMarker: ''
    }
  },
  computed: {
    userInfo() {
      return this.$root.userInfo
    }
  },
  watch: {
    'sch.txt' () {
      clearTimeout(tid);
      tid = setTimeout(() => {
        this.refresh()
      }, 1000)
    }
  },
  async mounted() {
    this.refresh()
  },
  methods: {
    async refresh() {
      this.loading = true;
      var admins = await Admins.listAll();

      var m = {}
      for (var n of admins) m[n.user_id] = n;
      this._adminMap = m;

      this.searchResult = [];
      this.nextMarker = '';
      await this.search()
    },
    async search() {
      this.loading = true;

      var opt = {
        // status: this.sch.status || '',
        // user_type: this.sch.user_type || '',
        marker: this.nextMarker || '',
        limit: 20
      };


      if (this.sch.txt) {
        if (this.sch.txt.startsWith('user-')) {
          //根据 userId
          try {
            var info = await Users.get(this.sch.txt, true)
            this.searchResult = [info];
          } catch (e) {
            this.searchResult = [];
          }
          this.nextMarker = '';
          this.loading = false;
          return;
        }
        //根据昵称
        opt.nick_name = this.sch.txt;
      }
      var result = await Users.list(opt)

      var t = clone(result.items)

      t.forEach(n => {
        var info = this._adminMap[n.user_id];

        if (info) {
          n.is_admin = true;
          n.privilege = info.privilege;
        } else {
          n.is_admin = false;
          n.privilege = '';
        }
        
        n.description = n.description || ''
      });

      this.searchResult = this.searchResult.concat(t);
      this.nextMarker = result.next_marker || '';

      this.loading = false;
    },

    async updateUserStatus(item, status) {
      var label = status == 'disabled' ? '禁用' : '启用';
      var msg = status == 'disabled' ? '禁用后该用户无法登录, ' : '';
      var b = await Dialog.confirm(`<span class="warning--text">${label}用户</span>`,
        `${msg}确定${label}用户: <b>${item.nick_name}</b>?`)
      if (!b) return;

      Toast.info(`正在${label}...`)
      await Users.update(item.user_id, {
        status: status
      })
      Toast.success(`${label}用户成功`);

      item.status = status;
    },
    async addUserToAdmins(item) {
      // this.$root.$emit('show::AddToAdminDialog',{
      //   item: item,
      //   callback: (xitem)=>{
      //      item.is_admin=true;
      //      item.privilege=item.privilege;
      //      if(item.description) item.description=item.description;
      //   }
      // })

      this.$root.$emit('show::UpdateAdminDialog', {
        item: item,
        isUpdate: false,
        callback: (xitem) => {
          item.is_admin = true;
          item.privilege = item.privilege;
          if (item.description) item.description = item.description;
        }
      })

    },
    showEditDesc(item) {
      this.$root.$emit('show::UserDescriptionDialog', {
        item: item,
        callback: (xitem) => {
          item.description = xitem.description;
        }
      })
    },
    async delUser(item, $index) {
      var b = await Dialog.confirm('<span class="error--text">删除用户</span>',
        `确定删除用户: <b>${item.nick_name}</b>?`)
      if (!b) return;

      Toast.info('正在删除...')
      await Users.del(item.user_id)
      Toast.success('删除用户成功')
      this.searchResult.splice($index, 1)
    },
    showUesrFolders(item) {

    }
  }
}
</script>

<template>
<v-container fluid grid-list-sm class="pa-0">
  <v-layout row>
    <v-flex xs12>

      <v-card>
        <v-toolbar dense flat>
          <v-icon class="deep-purple--text lighten-2">person</v-icon>
          <v-toolbar-title>管理员列表 ({{searchResult.length}}<span v-if="searchResult.length<admins.length">/{{admins.length}}</span>)</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field class="hidden-sm-and-down" v-model.trim="sch.txt" placeholder="按用户ID或昵称精确查询" prepend-icon="search" :append-icon="sch.txt?'close':''" @click:append="()=>(sch.txt='')"></v-text-field>
          <!-- <v-btn icon @click.stop="search"></v-btn> -->
        </v-toolbar>

        <v-toolbar class="hidden-md-and-up" dense flat>
          <v-text-field v-model.trim="sch.txt" placeholder="按用户ID或昵称精确查询" prepend-icon="search"
           :append-icon="sch.txt?'close':''" @click:append="()=>(sch.txt='')"></v-text-field>
        </v-toolbar>

        <v-card-text style="overflow:auto" class="pa-1">
          <table class="v-datatable v-table theme--light hidden-sm-and-down">
            <thead class="text-xs-left">
              <tr>
                <th>-</th>
                <th>头像</th>
                <th>昵称/用户Id</th>
                <th>权限</th>
                <th>描述</th>
                <th>最后修改</th>
                <th v-if="userInfo && userInfo.privilege=='grantable'" class="text-xs-center">操作</th>
              </tr>
            </thead>
            <tbody v-if="searchResult.length>0">
              <tr :class="item.status=='disabled'?'red lighten-4':''" v-for="(item,$index) in searchResult" :key="item.user_id">
                <td>{{$index+1}}.</td>
                <td>
                  <v-avatar size="30"><img v-if="item.avatar_url" :src="endpoint+item.avatar_url" /></v-avatar>
                </td>

                <td :class="item.status=='disabled'?'disabled-item-name':''">
                  {{item.nick_name}}<br/>
                  <span class="grey--text darken-4">{{item.user_id}}</span>
                </td>

                <td>
                  <span :class="F.privilegeFormat(item.privilege,1)+'--text'">{{F.privilegeFormat(item.privilege)}}</span>
                </td>
                <td>
                  <v-tooltip top>{{item.description}}
                  <div slot="activator" class="truncate grey--text" style="width:100px;">{{item.description}}</div>
                  </v-tooltip>
                </td>
                <td>{{F.timeFormat(item.updated_at)}}<br/>
                  <small class="grey--text darken-4">({{F.fromNow(item.updated_at)}})</small>
                </td>
                <td v-if="userInfo && userInfo.privilege=='grantable'" class="text-xs-center op-btns"><b>
            <!-- <v-btn small flat color="success" v-if="item.status=='disabled'" @click.prevent.stop="updateUserStatus(item,'enabled')">启用</v-btn>
            <v-btn small flat color="warning" v-else @click.prevent.stop="updateUserStatus(item,'disabled')">禁用</v-btn> -->
                <div style="width:90px;text-align:center">
                <v-tooltip top>修改
                  <v-btn class="ma-0" slot="activator" icon flat color="info" @click.prevent.stop="showUpdate(item, $index)">
                    <v-icon>edit</v-icon>
                  </v-btn>
               </v-tooltip>
                <v-tooltip top>删除
                  <v-btn class="ma-0" slot="activator" icon flat color="error" @click.prevent.stop="delUser(item, $index)">
                     <v-icon>close</v-icon>
                   </v-btn>
                  </v-tooltip>
                  </div>
                </b>
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
                ripple>


                <v-list-tile-avatar size="30">
                    <img v-if="item.avatar_url" :src="endpoint+item.avatar_url" />
                  </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title :class="item.status=='disabled'?'disabled-item-name':''">{{ item.nick_name }}</v-list-tile-title>
                  <v-list-tile-sub-title >
                     <small :class="F.privilegeFormat(item.privilege,1)+'--text'">{{F.privilegeFormat(item.privilege)}}</small>
                  </v-list-tile-sub-title>

                </v-list-tile-content>

                <v-list-tile-action v-if="userInfo && userInfo.privilege=='grantable'" @click.prevent.stop="showUpdate(item, $index)" style="min-width:45px">
                  <v-btn icon ripple color="info--text"><v-icon>edit</v-icon></v-btn>
                </v-list-tile-action>
                <v-list-tile-action v-if="userInfo && userInfo.privilege=='grantable'" @click.prevent.stop="delUser(item, $index)" style="min-width:45px">
                  <v-btn icon ripple color="error--text"><v-icon>close</v-icon></v-btn>
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
  <UpdateAdminDialog></UpdateAdminDialog>
</v-container>
</template>

<script>
import UpdateAdminDialog from './UpdateAdminDialog.vue'
import Admins from '@/services/admins.js'
import Users from '@/services/users.js'
import F from '@/services/f.js'
var tid;

export default {
  components: {
    UpdateAdminDialog
  },
  data() {
    return {
      F,
      endpoint: Global.endpoint,
      offset: 0,

      loading: false,
      loading2: false,

      sch: {
        txt: '',
        status: '',
        privilege: ''
      },
      searchResult: [],
      admins: []
    }
  },
  computed: {
    userInfo() {
      return this.$root.userInfo
    }
  },
  watch: {
    sch: {
      deep: true,
      handler(v) {
        clearTimeout(tid);
        tid = setTimeout(() => {
          if (!v.txt && !v.status && !v.privilege) {
            this.searchResult = clone(this.admins)
            return;
          }
          var t = [];

          this.admins.forEach(n => {

            if (v.txt) {
              if (n.nick_name.indexOf(v.txt) == -1 && n.user_id.indexOf(v.txt) == -1) {
                return
              }
            }
            if (v.status && n.status.indexOf(v.status) == -1) {
              return;
            }
            if (v.privilege && n.privilege.indexOf(v.privilege) == -1) {
              return;
            }
            t.push(n)
          });
          this.searchResult = clone(t);

        }, 600)
      }
    }
  },
  async mounted() {
    this.refresh()
  },
  methods: {
    async refresh() {
      this.searchResult = [];
      this.admins = [];
      await this.list()
    },
    async list() {
      this.loading = true;

      var t = await Admins.listAll(true)

      this.admins = clone(t)
      this.searchResult = clone(t);

      this.loading = false;
    },

    // async updateAdminStatus(item, status){
    //   var label= status=='disabled'?'禁用':'启用';
    //   var b = await Dialog.confirm(`<span class="warning--text">${label}管理员</span>`,
    //         `确定${label}管理员: <span class="headline">${item.nick_name}</span>?`)
    //   if(!b)return;
    //
    //   Toast.info(`正在${label}...`)
    //   await Admins.update(item.user_id, {status:status})
    //   Toast.success(`${label}管理员成功`)
    //   item.status=status;
    // },
    showUpdate(item) {
      this.$root.$emit('show::UpdateAdminDialog', {
        item: item,

        callback: (xitem) => {
          Object.assign(item, xitem)
        }
      })
    },
    showEditDesc(item) {
      this.$root.$emit('show::AdminDescriptionDialog', {
        item: item,
        callback: (xitem) => {
          item.description = xitem.description;
        }
      })
    },
    async delUser(item, $index) {
      var b = await Dialog.confirm('<span class="error--text">删除管理员</span>',
        `确定删除管理员: <b>${item.nick_name}</b>?`)
      if (!b) return;

      Toast.info('正在删除...')
      await Admins.del(item.user_id)
      Toast.success('删除管理员成功')
      this.searchResult.splice($index, 1)

      for (var i = 0; i < this.admins.length; i++) {
        if (this.admins[i].user_id == item.user_id) this.admins.splice(i, 1);
      }
    },
  }
}
</script>

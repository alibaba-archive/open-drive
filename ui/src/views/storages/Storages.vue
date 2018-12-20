<template>
  <v-container fluid grid-list-xs class="pa-0">
    <v-layout row wrap>
      <v-flex xs12>

        <v-card>
          <v-toolbar dense flat>
            <StorageIcon/>
            <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->
            <v-toolbar-title>存储配置 ({{searchResult.length}}<span v-if="searchResult.length<storages.length">/{{storages.length}}</span>)</v-toolbar-title>
            <v-spacer></v-spacer>

            <v-text-field class="hidden-sm-and-down" v-model.trim="sch.txt" placeholder="按名称模糊查询" prepend-icon="search" :append-icon="sch.txt?'close':''" @click:append="()=>(sch.txt='')"></v-text-field>

            <v-btn v-if="userInfo && userInfo.is_admin && userInfo.privilege!='readonly'" icon color="success" :to="{name:'CreateStorage'}">
              <v-icon>add</v-icon>
            </v-btn>

          </v-toolbar>
          <v-toolbar dense flat class="hidden-md-and-up">
            <v-text-field v-model.trim="sch.txt" placeholder="按名称模糊查询" prepend-icon="search" :append-icon="sch.txt?'close':''" @click:append="()=>(sch.txt='')"></v-text-field>
          </v-toolbar>

          <v-card-text style="overflow:auto" class="pa-1">
            <table class="v-datatable v-table theme--light hidden-sm-and-down">
              <thead class="text-xs-left">
                <tr>
                  <th>-</th>
                  <th>名称/描述</th>
                  <th>Region/默认云盘</th>
                  <th>最后修改</th>
                  <th v-if="userInfo" class="text-xs-right">操作</th>
                </tr>
              </thead>
              <tbody v-if="searchResult.length>0">
                <tr :class="item.status=='disabled'?'red lighten-4':''" v-for="(item,$index) in searchResult" :key="item.name">
                  <td>{{$index+1}}.</td>

                  <td :class="item.status=='disabled'?'disabled-item-name':''">
                    <StorageIcon/> {{item.storage_name}}
                    <v-tooltip right>{{item.description}}
                      <div slot="activator" class="truncate grey--text" style="width:100px;">{{item.description}}</div>
                    </v-tooltip>
                  </td>

                  <td>
                    <kbd>{{item.region}}</kbd>
                    <div class="info--text" v-if="item.init_drive_size">
                      <DriveIcon/> {{item.init_drive_name}}
                      <span v-if="item.init_drive_size>0">({{F.sizeFormat(item.init_drive_size)}}B)</span>
                      <span v-else>(无限制)</span>
                    </div>
                  </td>

                  <td>{{F.timeFormat(item.updated_at)}}<br/>
                    <small class="grey--text darken-4">({{F.fromNow(item.updated_at)}})</small>
                  </td>
                  <td v-if="userInfo" class="pa-0 text-xs-right op-btns">

                    <div v-if="userInfo.privilege!='readonly'" style="min-width: 220px; text-align: right">

                      <v-tooltip v-if="item.root_drive_id" top>进入根云盘
                        <v-btn slot="activator" class="ma-0" icon flat color="info" @click.prevent.stop="showRootDrive(item, $index)">
                          <v-icon>forward</v-icon>
                        </v-btn>
                      </v-tooltip>

                      <v-tooltip top>创建云盘
                        <v-btn slot="activator" class="ma-0" icon flat color="green" @click.prevent.stop="showAddDrive(item, $index)">
                          <v-icon>add</v-icon>
                        </v-btn>
                      </v-tooltip>

                      <v-tooltip top>修改
                        <v-btn slot="activator" class="ma-0" icon flat color="info" :to="{name:'UpdateStorage',params:{storageId:item.storage_id}}">
                          <v-icon>mode_edit</v-icon>
                        </v-btn>
                      </v-tooltip>
                      <v-tooltip top>删除
                        <v-btn slot="activator" class="ma-0" icon flat color="error" @click.prevent.stop="showDelete(item, $index)">
                          <v-icon>close</v-icon>
                        </v-btn>
                      </v-tooltip>

                    </div>

                    <v-tooltip v-else top>查看
                      <v-btn slot="activator" class="ma-0" icon flat color="info" :to="{name:'UpdateStorage',params:{storageName:item.storage_name}}">
                        <v-icon>arrow_forward</v-icon>
                      </v-btn>
                    </v-tooltip>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- mobile view -->
            <v-list class="hidden-md-and-up pa-0">
              <template v-for="(item,$index) in searchResult">
                <v-list-tile :key="item.storage_name" avatar ripple>

                  <v-list-tile-avatar>
                    <StorageIcon/>
                  </v-list-tile-avatar>

                  <v-list-tile-content>
                    <v-list-tile-title :class="item.status=='disabled'?'disabled-item-name':''">{{ item.storage_name }}</v-list-tile-title>
                    <v-list-tile-sub-title class="grey--text">{{ item.description }}</v-list-tile-sub-title>

                  </v-list-tile-content>
                  <v-list-tile-action>
                    <v-list-tile-action-text>
                      <kbd>{{ item.region }}</kbd>
                    </v-list-tile-action-text>
                    <small class="info--text" v-if="item.init_drive_size">
                      <DriveIcon/>
                      <!-- <small>{{item.init_drive_name}}</small> -->
                      <span v-if="item.init_drive_size>0">({{F.sizeFormat(item.init_drive_size)}}B)</span>
                      <span v-else>(无限制)</span>
                    </small>
                  </v-list-tile-action>

                  <v-list-tile-action>
                    <v-menu offset-y right>
                      <v-btn slot="activator" icon>
                        <v-icon>more_vert</v-icon>
                      </v-btn>
                      <v-list>
 

                        <v-list-tile v-if="item.root_drive_id" @click="showRootDrive(item, $index)" color="info">
                          <v-list-tile-title>
                            <v-icon class="info--text">forward</v-icon> 进入根云盘</v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile @click="showAddDrive(item, $index)" v-if="userInfo && userInfo.privilege!='readonly'" color="success">
                          <v-list-tile-title>
                            <v-icon class="success--text">add</v-icon> 创建云盘</v-list-tile-title>
                        </v-list-tile>

                        <v-list-tile @click="$router.push({name:'UpdateStorage', params:{storageId: item.storage_id}})" v-if="userInfo && userInfo.privilege!='readonly'" color="info">
                          <v-list-tile-title>
                            <v-icon class="info--text">mode_edit</v-icon> 修改</v-list-tile-title>
                        </v-list-tile>

                        <v-list-tile @click="showDelete(item, $index)" color="error">
                          <v-list-tile-title>
                            <v-icon class="error--text">close</v-icon> 删除</v-list-tile-title>
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

    <!-- <UpdateStorageDialog></UpdateStorageDialog> -->
    <CreateDriveDialog></CreateDriveDialog>

  </v-container>
</template>

<script>
// import UpdateStorageDialog from './UpdateStorageDialog'
import CreateDriveDialog from "../files/CreateDriveDialog";

import Drives from "@/services/drives.js";
import Storages from "@/services/storages.js";
import F from "@/services/f.js";
var tid;

export default {
  components: {
    // UpdateStorageDialog,
    CreateDriveDialog
  },
  data() {
    return {
      F,
      endpoint: Global.endpoint,
      offset: 0,

      loading: false,
      loading2: false,

      sch: {
        txt: ""
      },
      searchResult: [],
      storages: []
    };
  },
  computed: {
    userInfo() {
      return this.$root.userInfo;
    }
  },
  watch: {
    sch: {
      deep: true,
      handler(v) {
        clearTimeout(tid);
        tid = setTimeout(() => {
          this.search(v);
        }, 600);
      }
    }
  },
  async mounted() {
    this.refresh();
  },
  methods: {
    async refresh() {
      this.searchResult = [];
      this.storages = [];
      await this.list();
    },
    async list() {
      this.loading = true;

      var t = await Storages.listAll();

      this.storages = clone(t);
      this.searchResult = clone(t);

      this.loading = false;
    },
    search(v) {
      var v = v || this.sch;
      if (!v.txt) {
        this.searchResult = clone(this.storages);
        return;
      }
      var t = [];

      this.storages.forEach(n => {
        if (v.txt) {
          if (n.storage_name.indexOf(v.txt) == -1) {
            return;
          }
        }
        t.push(n);
      });
      this.searchResult = clone(t);
    },
    // showAdd() {
    //   this.$root.$emit('show::UpdateStorageDialog', {
    //     callback:  (xitem) => {
    //       this.showAddDriveToMe(xitem.storage_name, xitem.storage_id)
    //       this.refresh()
    //     }
    //   })
    // },
    // async showAddDriveToMe(storageName, storageId){
    //   var b = await Dialog.confirm('创建同名云盘','推荐立即创建同名云盘以便管理文件, 现在创建?')
    //   if(!b) return;
    //   Toast.info('正在创建同名云盘...')

    //   await Drives.add({
    //     description: storageName,
    //     drive_name: storageName,
    //     grant_to: this.userInfo.user_id,
    //     privilege: 'grantable',
    //     storage_name: storageName,
    //     storage_id: storageId,
    //     source_path: '/'
    //   });
    //   Toast.success('创建同名云盘成功')
    // },
    async showAddDrive(item) {
      var storageName = item.storage_name;
      this.$root.$emit("show::CreateDriveDialog", {
        item: {
          description: storageName,
          drive_name: storageName + "-drive-" + parseInt(Math.random() * 10000),
          grant_to: [],
          storage_id: item.storage_id
        },
        hideSourceItems: true,
        callback: async () => {}
      });
    },
    async updateStatus(item, status) {
      var label = status == "disabled" ? "禁用" : "启用";
      var msg =
        status == "disabled"
          ? "禁用后该存储配置以及关联的云盘将无法被访问，"
          : "";
      var b = await Dialog.confirm(
        `<span class="warning--text">${label}存储配置</span>`,
        `${msg}确定${label}存储配置: <b>${item.storage_name}</b>?`
      );
      if (!b) return;

      Toast.info(`正在${label}...`);
      await Storages.update(item.storage_name, { status: status });
      Toast.success(`${label}存储配置成功`);

      item.status = status;
    },
    showUpdate(item, $index) {
      this.$root.$emit("show::UpdateStorageDialog", {
        isUpdate: true,
        item: item,
        callback: xitem => {
          this.searchResult.splice($index, 1, xitem);
        }
      });
    },
    async showDelete(item, $index) {
      var b = await Dialog.confirm(
        '<span class="error--text">删除存储配置</span>',
        `有关联的云盘则无法删除存储配置，确定删除存储配置: <b>${
          item.storage_name
        }</b>?`
      );
      if (!b) return;

      Toast.info("正在删除...");
      await Storages.del(item.storage_id);

      // try{
      //   await Storages.del(item.storage_id)
      // }catch(e){
      //   // 屏蔽强制删除的功能
      //   if(false && e.data.code=='NotEmpty'){

      //     await delay(600);

      //     var b2 = await Dialog.confirm('<span class="error--text">强制删除存储配置</span>',
      //           `将强制删除所有关联的云盘将不能访问，确定删除存储配置: <b>${item.storage_name}</b>?`)
      //     if(!b2)return;

      //     Toast.info('正在删除...')

      //     try{
      //       await Storages.del(item.storage_id, true)
      //     }catch(e2){
      //       return;
      //     }
      //   }
      //   else return;
      // }
      Toast.success("删除存储配置成功");

      this.searchResult.splice($index, 1);
      this.storages.splice(this.storages.indexOf(item), 1);
    },
    async showRootDrive(item) {
      var storageId = item.storage_id;
      var driveId = item.root_drive_id;
      if (driveId) {
        this.$router.push({
          name: "StorageDrive",
          params: { storageId, driveId }
        });
      }
    }
  }
};
</script>

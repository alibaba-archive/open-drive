<template>
<v-container fluid grid-list-sm class="pa-0">
  <v-layout row>
    <v-flex xs12>


      <v-card>
        <v-toolbar dense flat>
           <DriveIcon/>
          <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->
          <v-toolbar-title>我的云盘 ({{searchResult.length}})</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-text-field class="hidden-sm-and-down" v-model.trim="sch.txt" placeholder="按名称前缀模糊查询" prepend-icon="search" :append-icon="sch.txt?'close':''"
          @click:append="()=>(sch.txt='')"></v-text-field>

        </v-toolbar>

        <v-toolbar class="hidden-md-and-up" dense flat>
          <v-text-field v-model.trim="sch.txt" placeholder="按名称前缀模糊查询" prepend-icon="search" :append-icon="sch.txt?'close':''"
          @click:append="()=>(sch.txt='')"></v-text-field>
        </v-toolbar>


        <v-card-text style="overflow:auto" class="pa-1">
          <table class="v-datatable v-table theme--light hidden-sm-and-down">
            <thead class="text-xs-left">
              <tr>
                <th>-</th>
                <th>名称/描述</th>
                <!-- <th>权限/有效期</th> -->
                <th>容量</th>
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
                  <v-tooltip right>{{item.description}}
                  <div slot="activator" class="truncate grey--text" style="width:100px;">{{item.description}}</div>
                  </v-tooltip>
                </td>

                <!-- <td>
                  <span :class="F.privilegeFormat(item.privilege,1)+'--text'">{{F.privilegeFormat(item.privilege)}}</span>

                  <div v-if="item.expires_time=='Never'">永久</div>
                  <div v-else>{{F.timeFormat(item.expires_time)}}<br/>
                    <small class="grey--text darken-4">({{F.fromNow(item.expires_time,1)}})</small>
                  </div>
                </td> -->

                <td>
                  <span v-if="item.total_size>0">{{F.sizeFormat(item.used_size)}}/{{F.sizeFormat(item.total_size)}}</span>
                  <span v-else>不限制容量</span>
                </td>

                <td>{{F.timeFormat(item.created_at)}}<br/>

                  <small class="grey--text darken-4">({{F.fromNow(item.created_at)}})</small>
                </td>
                <td class="text-xs-center op-btns">
                  <v-tooltip left>进入
                  <v-btn slot="activator" icon flat color="info"
                  :to="{name:'Drive',params:{driveId:item.drive_id}}"><v-icon>forward</v-icon></v-btn>
                </v-tooltip>
                </td>
              </tr>
            </tbody>
          </table>

           <!-- mobile view -->
           <v-list class="hidden-md-and-up pa-0">
            <template v-for="(item,$index) in searchResult" >
              <v-list-tile
               :key="item.drive_id"
                avatar
                ripple
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

                  <v-btn color="info" icon flat @click="$router.push({name:'Drive',params:{driveId:item.drive_id}})">
                    <v-icon class="info--text">forward</v-icon>
                  </v-btn>
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

  <CreateDriveDialog></CreateDriveDialog>

</v-container>
</template>

<script>
import CreateDriveDialog from '../files/CreateDriveDialog'

import Drives from '@/services/drives.js'
import F from '@/services/f.js'
var tid;

export default {
  components: {
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
        txt: ''
      },
      searchResult: [],
      keepItems: [],
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
      },600)
    }
  },
  async mounted() {
    this.refresh()
  },
  methods: {
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
    async refresh(){
      this.loading=true;

      this.searchResult=[];
      this.keepItems=[];

      this.loading=true;

      var arr = await Drives.listMyAll()

      this.searchResult = clone(arr)
      this.keepItems = clone(arr)

      this.loading=false;
    },


    showAdd() {
      this.$root.$emit('show::UpdateDriveDialog', {
        callback:  (xitem) => {
          this.showAddDrive(xitem.drive_name)
          this.refresh()
        }
      })
    },
    async showAddDrive(driveName){
      var b = await Dialog.confirm('创建同名云盘','推荐立即创建同名云盘以便管理文件, 现在创建?')
      if(!b) return;
      Toast.info('正在创建同名云盘...')

      await Drives.add({
        description: storageName,
        grant_to: this.userInfo.user_id,
        privilege: 'grantable',
        source_type: 'storage',
        source_key: storageName,
        source_path: '/'+storageName+'/'
      });
      Toast.success('创建同名云盘成功')
    }
  }
}
</script>

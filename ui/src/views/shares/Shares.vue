<template>
<v-container fluid grid-list-sm class="pa-0">
  <v-layout row>
    <v-flex xs12>


      <v-card>
        <v-toolbar dense flat>
          <ShareIcon/>
          <v-toolbar-title>他人与我共享的文件夹 ({{searchResult.length}})</v-toolbar-title>
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
                <th>权限</th>
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
                  <v-tooltip right>{{item.description}}
                  <div slot="activator" class="truncate grey--text" style="width:100px;">{{item.description}}</div>
                  </v-tooltip>
                </td>

                <td>
                  <span :class="F.privilegeFormat(item.privilege,1)+'--text'">{{F.privilegeFormat(item.privilege)}}</span>
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
                  <v-tooltip left>进入
                  <v-btn slot="activator" icon flat color="info"
                  :to="{name:'Share',params:{shareId:item.share_id}}"><v-icon>forward</v-icon></v-btn>
                </v-tooltip>
                </td>
              </tr>
            </tbody>
          </table>






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

                  <v-btn color="info" icon flat @click="$router.push({name:'Share',params:{shareId:item.share_id}})">
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


</v-container>
</template>

<script>

import Shares from '@/services/shares.js'
import F from '@/services/f.js'
var tid;

export default {
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
      keepItems: []
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
    this.refresh()
  },
  methods: {
     async refresh(){
      this.loading=true;

      this.searchResult=[];
      this.keepItems=[];

      this.loading=true;

      var arr = await Shares.listMyAll()

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
  }
}
</script>

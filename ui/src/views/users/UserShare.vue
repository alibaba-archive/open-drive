<template>
<v-container fluid grid-list-sm>
  <v-layout row>
    <v-flex xs12>

      <v-card>
        <v-toolbar dense flat>
          <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->
          <v-btn small icon :to="{name:'UserShares',params:{userId: $route.params.userId}}">
            <v-icon>arrow_back</v-icon>
          </v-btn>
          <v-toolbar-title v-if="shareInfo">
            <ShareIcon/>
            {{shareInfo.share_name}}
            <small>(
              <span :class="F.privilegeFormat(shareInfo.privilege,1)+'--text'">
                {{F.privilegeFormat(shareInfo.privilege)}},</span>
            <span v-if="shareInfo.expires_time!='Never'">截止到 {{F.timeFormat(shareInfo.expires_time)}}</span>
            <span v-if="shareInfo.total_size>0">{{F.sizeFormat(shareInfo.used_size)}}B/{{F.sizeFormat(shareInfo.total_size)}}B</span>
            <span v-else>不限制容量</span>
            )</small>

          </v-toolbar-title>
          <v-spacer></v-spacer>

        </v-toolbar>


        <v-card-text class="pa-0">

           <FileExplorer type="share" grantToUserId="*" :driveOrShareId="$route.params.shareId" @fileSizeChanged="onFileSizeChange"></FileExplorer>

        </v-card-text>

      </v-card>
    </v-flex>
  </v-layout>



</v-container>
</template>

<script>
import FileExplorer from '../files/FileExplorer'


import Drives from '@/services/drives.js'
import Shares from '@/services/shares.js'
import Files from '@/services/files.js'
import F from '@/services/f.js'
var tid;

export default {
  components: {
    FileExplorer
  },
  data() {
    return {
      F,

      sch: {
        dir_path: '/',
        limit: 100,
        marker: ''
      },
      shareId: '',

      fab: false,
      fab2: true,
      fab3: true,

      endpoint: Global.endpoint,

      shareInfo: null,

      loading: false,
      loading2: true,

      items: [],

      lastClickItemIndex: -1,
      keepSel: [],
      hasSel: [],
      hasFolderSel: false,

      // 复制 移动
      isMove: false,
      fromPath: '',

      height: 0,
    }
  },
  async mounted() {
    this.shareId = this.$route.params.shareId;
    this.getShareInfo()
  },
  methods: {
    async getShareInfo() {
      this.shareInfo = await Shares.get('*',this.shareId)
    },
    onFileSizeChange(){
      clearTimeout(tid)
      tid=setTimeout(()=>{
        console.log('--------onFileSizeChange-----------')
        this.getShareInfo();
      },600)

    }
  }
}
</script>

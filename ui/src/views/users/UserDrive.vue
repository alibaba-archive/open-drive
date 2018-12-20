<template>
<v-container fluid grid-list-sm class="pa-0">
  <v-layout row>
    <v-flex xs12>

      <v-card>
        <v-toolbar dense flat>
          <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->
          <v-btn small icon :to="{name:'UserDrives',params:{userId: $route.params.userId}}">
            <v-icon>arrow_back</v-icon>
          </v-btn>
          <v-toolbar-title v-if="driveInfo">
            <DriveIcon/>
            {{driveInfo.drive_name}}
            <small>(
              <!-- <span :class="F.privilegeFormat(driveInfo.privilege,1)+'--text'">
                {{F.privilegeFormat(driveInfo.privilege)}},</span>
            <span v-if="driveInfo.expires_time!='Never'">截止到 {{F.timeFormat(driveInfo.expires_time)}}</span> -->
            <span v-if="driveInfo.total_size>0">{{F.sizeFormat(driveInfo.used_size)}}B/{{F.sizeFormat(driveInfo.total_size)}}B</span>
            <span v-else>不限制容量</span>
            )</small>

          </v-toolbar-title>
          <v-spacer></v-spacer>

        </v-toolbar>


        <v-card-text class="pa-0">

           <FileExplorer type="drive" grantToUserId="*" :driveOrShareId="$route.params.driveId" @fileSizeChanged="onFileSizeChange"></FileExplorer>

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
      driveId: '',

      fab: false,
      fab2: true,
      fab3: true,

      endpoint: Global.endpoint,

      driveInfo: null,

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
    this.driveId = this.$route.params.driveId;
    this.getDriveInfo()
  },
  methods: {
    async getDriveInfo() {
      this.driveInfo = await Drives.get('*',this.driveId)
    },
    onFileSizeChange(){
      clearTimeout(tid)
      tid=setTimeout(()=>{
        console.log('--------onFileSizeChange-----------')
        this.getDriveInfo();
      },600)

    }
  }
}
</script>

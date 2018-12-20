<template>
<v-container fluid grid-list-sm class="pa-0">
  <v-layout row>
    <v-flex xs12>

      <v-card>
        <v-toolbar dense flat>
          <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->
          <v-btn small icon :to="{name:'Shares'}" v-if="userInfo.nick_name">
            <v-icon>arrow_back</v-icon>
          </v-btn>
          <v-toolbar-title v-if="shareInfo">
            <ShareIcon/>
            {{shareInfo.share_name}}
            <small :class="F.privilegeFormat(shareInfo.privilege,1)+'--text'">({{F.privilegeFormat(shareInfo.privilege)}})</small>

          </v-toolbar-title>
          <v-spacer></v-spacer>

        </v-toolbar>


        <v-card-text class="pa-0">

           <FileExplorer type="share" :driveOrShareId="$route.params.shareId"></FileExplorer>

        </v-card-text>

      </v-card>
    </v-flex>
  </v-layout>



</v-container>
</template>

<script>
import FileExplorer from '../files/FileExplorer'

import Shares from '@/services/shares.js'
import F from '@/services/f.js'

export default {
  components: {
    FileExplorer
  },
  data() {
    return {
      F,

      driveId: '',

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
  computed: {
    userInfo(){
      return this.$root.userInfo || {};
    }
  },
  async mounted() {
    this.shareId = this.$route.params.shareId;
    this.getShareInfo()
    //this.refresh()
  },
  methods: {
    async getShareInfo() {
      this.shareInfo = await Shares.getMy(this.shareId)
    }
  }
}
</script>

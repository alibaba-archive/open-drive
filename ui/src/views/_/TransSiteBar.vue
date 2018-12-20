<template>
<v-navigation-drawer style="z-index:1000" temporary clipped fixed width="400" v-model="drawer" right>

  <v-toolbar flat dense class="trans-toolbar">
    <v-toolbar-title v-if="!isElectron">
      上传列表
    </v-toolbar-title>

    <v-btn v-if="isElectron" @click="tab=1" :class="tab==1?'info':'info--text'" class="ma-0 ml-1" depressed style="min-width:40px;">
      上传列表
    </v-btn>

    <v-btn v-if="isElectron" @click="tab=2" :class="tab==2?'info':'info--text'" class="ma-0" depressed style="min-width:40px;">
      下载列表
    </v-btn>

    <v-spacer></v-spacer>

    <v-tooltip bottom>全部开启
      <v-btn slot="activator" color="info--text ma-1" icon small @click.prevent.stop="startAll()">
        <v-icon>play_arrow</v-icon>
      </v-btn>
    </v-tooltip>

    <v-tooltip bottom>全部暂停
      <v-btn slot="activator" color="warning--text ma-1" icon small @click.prevent.stop="stopAll()">
        <v-icon>pause</v-icon>
      </v-btn>
    </v-tooltip>

    <v-tooltip bottom>清空已完成的
      <v-btn slot="activator" class="success--text ma-1" icon small @click.prevent.stop="clearAllFinished()">
        <v-icon>clear_all</v-icon>
      </v-btn>
    </v-tooltip>

    <v-tooltip bottom>清空全部
      <v-btn slot="activator" color="error--text ma-1" icon small @click.prevent.stop="showRemoveAllJob()">
        <v-icon>clear_all</v-icon>
      </v-btn>
    </v-tooltip>



    <v-tooltip bottom>隐藏
      <v-btn slot="activator" class="ma-1" icon small @click.prevent.stop="drawer=false">
        <v-icon>arrow_forward</v-icon>
      </v-btn>
    </v-tooltip>


  </v-toolbar>
  <v-divider></v-divider>


  <v-list v-if="tab==1" dense class="pt-0">

    <template v-if="uploadList_ref.length>0" v-for="(item,$index) in uploadList_ref">
       <v-tooltip left :key="$index">
         <div style="width:300px">
           <div class="light-green--text">{{item.from.path||item.from.name}}</div>
           <div class="light-blue--text">{{item.to.path}}</div>
         </div>
        <v-list-tile slot="activator" :key="item.id" style="position:relative">
          <div :style="`width:${item.progress*100}%;`" :class="`${F.statusColor(item.status)} trans-item-bg`"></div>

          <v-list-tile-avatar>
            <v-progress-circular :value="item.progress*100" :size="36"  :rotate="-90"
              :class="F.statusColor(item.status)+'--text'">

              <v-icon v-if="item.status=='finished'" class="ma-0 success--text">check</v-icon>
              <v-btn v-if="item.status=='stopped'||item.status=='failed'" @click.stop="checkStartJob(item)" small icon class="ma-0 info--text"><v-icon>play_arrow</v-icon></v-btn>
              <v-btn v-if="item.status=='running'||item.status=='waiting'" @click.stop="item.stop" class="ma-0 warning--text" small icon><v-icon>pause</v-icon></v-btn>

            </v-progress-circular>
          </v-list-tile-avatar>
          <v-list-tile-content>


            <v-list-tile-title class="truncate" v-html="item.from.name"></v-list-tile-title>
            <v-list-tile-sub-title class="truncate grey--text">
              <span v-if="item.speed">速度: {{F.sizeFormat(item.speed)}}/s, 剩余 {{F.leftTime(item.predictLeftTime)}}</span>
              <span v-if="!item.speed">大小:{{F.sizeFormat(item.from.size)}}</span>
              <span>({{parseInt(item.progress*10000)/100}}%)</span>
            </v-list-tile-sub-title>
            <!-- <div>item.from.name</div>
                 <v-progress-linear :value="item.progress*100" height="5"
                 :secondary="item.status=='waiting'"
                 :info="item.status=='running'"
                 :warning="item.status=='stopped'"
                 :error="item.status=='failed'"
                 :success="item.status=='finished'"></v-progress-linear> -->
            <!--  -->
          </v-list-tile-content>

          <v-list-tile-action>

              <v-btn color="error--text" icon @click="showRemoveJob(item, $index)"><v-icon>close</v-icon></v-btn>
            </v-list-tile-action>

        </v-list-tile>
      </v-tooltip>

        <v-divider :key="item.id+'_div'"></v-divider>

      </template>

  </v-list>

  <v-list v-if="tab==2" dense class="pt-0">


    <template v-if="downloadList_ref.length>0" v-for="(item,$index) in downloadList_ref">
       <v-tooltip left :key="$index">
         <div style="width:300px">
           <div class="light-green--text">{{item.from.path}}</div>
           <div class="light-blue--text">{{item.to.path}}</div>
         </div>
        <v-list-tile slot="activator" :key="item.id" style="position:relative">

          <div :style="`width:${item.progress*100}%;`" :class="`${F.statusColor(item.status)} trans-item-bg`"></div>

          <v-list-tile-avatar>

            <v-progress-circular :value="item.progress*100" :size="36"  :rotate="-90"
              :class="F.statusColor(item.status)+'--text'">

              <v-icon v-if="item.status=='finished'" class="ma-0 success--text">check</v-icon>
              <v-btn v-if="item.status=='stopped'||item.status=='failed'" @click.stop="checkStartJob(item)" small icon class="ma-0 info--text"><v-icon>play_arrow</v-icon></v-btn>
              <v-btn v-if="item.status=='running'||item.status=='waiting'" @click.stop="item.stop" class="ma-0 warning--text" small icon><v-icon>pause</v-icon></v-btn>

            </v-progress-circular>
          </v-list-tile-avatar>
          <v-list-tile-content>


            <v-list-tile-title class="truncate" v-html="item.to.name"></v-list-tile-title>
            <v-list-tile-sub-title class="truncate grey--text">
              <span v-if="item.speed">速度: {{F.sizeFormat(item.speed)}}/s, 剩余 {{F.leftTime(item.predictLeftTime)}}</span>
              <span v-if="!item.speed">大小:{{F.sizeFormat(item.from.size)}}</span>
              <span>({{parseInt(item.progress*10000)/100}}%)</span>

            </v-list-tile-sub-title>

            <!-- <v-progress-linear :value="item.progress*100" height="5"
            :secondary="item.status=='waiting'"
            :info="item.status=='running'"
            :warning="item.status=='stopped'"
            :error="item.status=='failed'"
            :success="item.status=='finished'"></v-progress-linear> -->

          </v-list-tile-content>

          <v-list-tile-action>

              <v-btn color="error--text" icon @click="showRemoveJob(item, $index)"><v-icon>close</v-icon></v-btn>
            </v-list-tile-action>

        </v-list-tile>
      </v-tooltip>

        <v-divider :key="item.id+'_div'"></v-divider>

      </template>

  </v-list>

</v-navigation-drawer>
</template>

<script>
import Files from '@/services/files'
import F from '@/services/f'
import NodeDownloadManager from '@/services/node/download-manager.js'
import NodeUploadManager from '@/services/node/upload-manager.js'

var tid;
export default {
  data() {
    return {
      isElectron: window.isElectron,
      F,
      tab: 1,
      tabItems: ['上传列表', '下载列表'],
      drawer: false,
      uploadList_ref: [], //上传列表
      downloadList_ref: [], //下载列表
    }
  },
  watch: {
    uploadList_ref: {
      deep: true,
      handler: function(v) {
        //this.$root.$emit('uploadListChanged', v);
      }
    },
    downloadList_ref: {
      deep: true,
      handler: function(v) {
        //this.$root.$emit('downloadListChanged', v);
      }
    }
  },
  // computed: {
  //
  // },
  mounted() {
    this.$root.$on('uploadFiles', (opt) => {
      this.drawer = true;
      this.tab = 1;
      console.log('TransSiteBar.uploadFiles', opt)
      this.addUpload(opt);
    });


    this.$root.$on('downloadFiles', (opt) => {
      this.drawer = true;
      this.tab = 2;
      console.log('TransSiteBar.downloadFiles:', opt)
      this.addDownload(opt);
    });


    this.$root.$on('load::UserInfo', (userInfo) => {
      if (isElectron) {
        NodeUploadManager.init(userInfo, this.uploadList_ref);
        NodeDownloadManager.init(userInfo, this.downloadList_ref);
      }
    })

    this.$root.$on('toggle::TransferWin', () => {
      this.drawer = !this.drawer;
    });
    this.$root.$on('show::TransferWin', () => {
      this.drawer = true;
    });
    this.$root.$on('hide::TransferWin', () => {
      this.drawer = false;
    });
  },
  methods: {
    async addUpload({
      type,
      driveId,
      storeType,
      toPath,
      files
    }) {
      //console.log(`addUpload: ${driveId}, ${storeType}, ${toPath}`, files);

      // for(var n of files){
      //   try{
      //     await checkIsFile(n);
      //   }catch(e){
      //     console.error(e)
      //     // Toast.error('不支持目录拖放上传，请用上传目录按钮');
      //     return;
      //   }
      // }

      //添加到上传列表
      if (isElectron) {
        await NodeUploadManager.uploadFiles(type, driveId, storeType, toPath, files, this.uploadList_ref);
      } else {
        await Files.uploadFiles(type, driveId, storeType, toPath, files, this.uploadList_ref);
      }
      //全部完成后刷新
      this.$root.$emit('uploadListChanged', this.uploadList_ref);
    },
    async addDownload({
      type,
      driveId,
      storeType,
      toPath,
      items,
      dirPath
    }) {
      items.forEach(n => {
        n.relativePath = n.path.substring(dirPath)
      });

      if (isElectron) {
        //添加到下载列表
        await NodeDownloadManager.downloadFiles(type, driveId, storeType, toPath, dirPath, items, this.downloadList_ref);
      } else {
        // 前端没有下载功能
      }
      //全部完成后刷新
      //this.$root.$emit('downloadListChanged', this.downloadList_ref);
    },
    clearAllFinished() {

      if (this.tab == 1) {
        var arr = this.uploadList_ref;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].status == 'finished') {
            arr.splice(i, 1);
            i--;
          }
        }
        this.$root.$emit('uploadListChanged', this.uploadList_ref);
      } else {
        var arr = this.downloadList_ref;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].status == 'finished') {
            arr.splice(i, 1);
            i--;
          }
        }
        this.$root.$emit('downloadListChanged', this.downloadList_ref);
      }


    },
    startAll() {
      if (isElectron) {
        if (this.tab == 1) NodeUploadManager.startAll();
        else NodeDownloadManager.startAll();
      } else {
        Files.startAllUpload();
      }

    },
    stopAll() {
      if (isElectron) {
        if (this.tab == 1) NodeUploadManager.stopAll();
        else NodeDownloadManager.stopAll();
      } else {
        Files.stopAllUpload();
      }

    },
    async showRemoveAllJob(){
      var b = await Dialog.confirm('清空所有任务', '确定清空?');
      if (!b) return;

      var arr = this.tab==1?this.uploadList_ref : this.downloadList_ref;
      for (var i = 0; i < arr.length; i++) {
        var n = arr[i];
        if (n.status == 'running' || n.status == 'waiting'|| n.status == 'verifying') n.stop();
        arr.splice(i, 1);
        i--;
      }

      if(isElectron){
        if (this.tab == 1) {
          NodeUploadManager.saveProg();
          this.$root.$emit('uploadListChanged', this.uploadList_ref);
        } else {
          NodeDownloadManager.saveProg();
          this.$root.$emit('downloadListChanged', this.downloadList_ref);
        }
      }else{
        this.$root.$emit('uploadListChanged', this.uploadList_ref);
      }
    },
    async showRemoveJob(item, i) {
      if (item.status != 'finished') {
        var b = await Dialog.confirm('删除该任务', '确定删除?');
        if (!b) return;
      }

      if (item.status == 'running' || item.status == 'waiting')
        item.stop();

      if (this.tab == 1) {
        this.uploadList_ref.splice(i, 1)
        this.$root.$emit('uploadListChanged', this.uploadList_ref);
      } else {
        this.downloadList_ref.splice(i, 1)
        this.$root.$emit('downloadListChanged', this.downloadList_ref);
      }
    },
    checkStartJob(item) {

      item.wait();
      if(isElectron){
        if (this.tab == 1) {
          NodeUploadManager.checkStart();
        } else {
          NodeDownloadManager.checkStart();
        }
      }else{
        Files.checkStart();
      }
    }
  }
}


// function checkIsFile(file, callback){
//   return new Promise((a,b)=>{
//     var fr = new FileReader();
//     fr.readAsDataURL(file);
//     fr.onload=function(e){
//         a();
//     }
//     fr.onerror=function(e){
//         b(e);
//     }
//   });
// };
</script>

<style>
.trans-toolbar .toolbar__content>:not(.btn):not(.menu):first-child:not(:only-child),
.trans-toolbar .toolbar__extension>:not(.btn):not(.menu):first-child:not(:only-child) {
    margin-left: 4px;
}
.trans-toolbar .toolbar__content>:not(.btn):not(.menu):last-child:not(:only-child),
.trans-toolbar .toolbar__extension>:not(.btn):not(.menu):last-child:not(:only-child) {
    margin-right: 4px;
}
.trans-item-bg{
  height:100%;position:absolute;top:0px;left:0px;opacity:0.2;
}
</style>

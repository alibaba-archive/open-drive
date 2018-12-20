<template>
<v-dialog v-model="dialog" fullscreen>
  <v-card dark>
    <v-toolbar flat dense>
      <v-toolbar-title>
        <v-icon class="red--text">fa-file-o</v-icon>
        <small>{{ title }}</small>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <DownloadButton :driveId="driveOrShareId" :type="type" :item="item" @done="dialog=false"></DownloadButton>
      <v-btn icon @click.stop="dialog=false"><v-icon>close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text class="text-xs-center pa-1" :style="{height: '250px'}" style="overflow: auto; padding-top: 20px !important;">
      <div>
        <v-icon :size="100">insert_drive_file</v-icon>
      </div>
      <div>
        <span>{{ title }}</span>
      </div>
      <div>
        <span>size: </span>
        <span>{{ F.sizeFormat(item.size) }}</span>
      </div>
      <div>
        <h3>当前文件不支持预览!</h3>
      </div>
      <div>
        <v-btn @click="openDownloadUrl">下载</v-btn>
      </div>
    </v-card-text>
  </v-card>
</v-dialog>
</template>
<script>
import F from '@/services/f.js'
import Files from '@/services/files.js'
import DownloadButton from './DownloadButton'

export default {
  props: ['type','driveOrShareId'],
  components:{
    DownloadButton
  },
  data() {
    return {
      F,
      dialog: false,
      dialogContentHeight: 300,
      title: "",
      item: {},
      fileType: ""
    }
  },
  mounted() {
    this.$root.$on('show::PreviewOtherDialog', (item) => {
      this.item = item.item;
      this.fileType = item.fileType;
      this.dialog = true;
      this.title = this.item.name;
    });
  },
  destroyed(){
    this.$root.$off('show::PreviewOtherDialog')
  },
  methods: {
    openDownloadUrl(){
      if(window.isElectron){
        this.$root.$emit('showElectronDownloadDialog',{
          items: [this.item]
        });
      }else{
        window.open(this.download_url);
      }
    }
  }
}
</script>

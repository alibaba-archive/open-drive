<template>
<v-dialog v-model="dialog"  fullscreen>

  <v-card dark>
    <v-toolbar flat dense v-show="!fullScreenModel">
      <v-toolbar-title>
        <v-icon class="red--text">fa-file-o</v-icon>&nbsp; 图片预览
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <DownloadButton :driveId="driveId" :type="type" :item="item" @done="dialog=false"></DownloadButton>

      <v-btn icon @click.stop="dialog=false"><v-icon>close</v-icon></v-btn>
    </v-toolbar>

    <v-card-text class="text-xs-center pa-1" :style="{height: height}" style="overflow: auto">

      <img ref="imgDom" :src="item.download_url" :alt="item.name" style="display: none;" />

    </v-card-text>
    <!-- <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn class="grey--text darken-1" flat="flat" @click.native="dialog = false">关闭</v-btn>
    </v-card-actions> -->
  </v-card>
</v-dialog>
</template>
<script>

import Files from '@/services/files.js'
import DownloadButton from './DownloadButton'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.min.css'

var tid;
var pauseInterval;
export default {
  components:{
    DownloadButton
  },
  data() {
    return {
      dialog: false,
      dialogContentHeight: 300,
      driveId: '',
      type: '',
      viewer: null,
      fullScreenModel: false,
      viewerFull: null,
      viewerExit: null,
      item: {
        name: '',
        path: '',
        size: '',
        status: '',
        download_url: ''
      },

      loading: true,
    }
  },
  computed: {
    height(){
      return this.dialogContentHeight + "px";
    }
  },
  watch: {
    dialog(val){
      if(val){
        this.$root.$on('window::resize', this.calcHeight);
      }
      else{
        this.$root.$off('window::resize', this.calcHeight);
        if(this.viewer){
          this.viewer.destroy();
          this.viewer = null;
        }
      }
    }
  },
  mounted() {
    this.$root.$on('show::PreviewImageDialog', ({
      item,
      type,
      driveId
    }) => {
      this.calcHeight();
      this.type = type;
      this.driveId = driveId;
      this.item = item;
      this.dialog =true;
      this.loadViewer();
    });
  },
  destroyed(){
    this.$root.$off('show::PreviewImageDialog')
  },
  methods: {
    calcHeight(){
      this.dialogContentHeight = document.documentElement.clientHeight - 50;
    },
    loadViewer(){
      this.viewer = new Viewer(this.$refs.imgDom, {
        inline: true,
        button: true,
        navbar: false,
        toolbar: {
          zoomIn: 1,
          zoomOut: 1,
          oneToOne: 1,
          reset: 1,
          prev: 0,
          play: 0,
          next: 0,
          rotateLeft: 1,
          rotateRight: 1,
          flipHorizontal: 1,
          flipVertical: 1
        }
      });
      this.viewerFull = this.viewer.full.bind(this.viewer);
      this.viewer.full = () => {
        this.fullScreenModel = true;
        this.viewerFull();
        return this.viewer;
      };
      this.viewerExit = this.viewer.exit.bind(this.viewer);
      this.viewer.exit = () => {
        this.fullScreenModel = false;
        this.viewerExit();
        return this.viewer;
      };
    }
  }
}

// function parseTimelen(str){
//   var a1 = str.split('.');
//   var arr = a1[0].split(':');
//   var ms = (a1.length==2)? (parseInt(a1[1])/1000): 0;
//   return parseInt(arr[0])*3600 + parseInt(arr[1])*60  + parseInt(arr[2]) + ms;
// }
</script>

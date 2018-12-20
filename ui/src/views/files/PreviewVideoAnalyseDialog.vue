<template>
  <v-dialog v-model="dialog" fullscreen>
    <v-card dark style="background: #262a2d;">
      <v-toolbar dense>
        <v-toolbar-title>
          <v-icon class="red--text">fa-file-o</v-icon>
          <small>{{ title }}</small>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <DownloadButton :driveId="driveOrShareId" :type="type" :item="item" @done="dialog=false"></DownloadButton>
        <v-btn icon @click.stop="close()"><v-icon>close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text class="text-xs-center pa-1" style="height: calc(100% - 48px);position: absolute;top: 48px;">
        <v-progress-circular
          v-show="isLoading"
          :size="50"
          color="primary"
          indeterminate
        ></v-progress-circular>
        <div style="text-align: left; height: 100%;overflow: auto;" v-show="!isLoading">
          <iframe frameborder="0" ref="videoFrame" width="100%" height="100%" style="display:block;"></iframe>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue'
import _ from 'underscore'
import Files from '@/services/files'
import DownloadButton from './DownloadButton'

export default {
  components:{
    DownloadButton
  },
  props: ['type','driveOrShareId'],
  data() {
    return {
      title: "",
      dialog: false,
      loading: false,
      dialogContentHeight: 300,
      download_url: "",
      fileType: "",
      item: {},
      videoConfig: {},
      analyseConfig: {},
      analyseSwitch: true,
      isLoading: true
    }
  },
  computed: {
    videoFrame(){
      return this.$refs.videoFrame;
    },
    height(){
      return this.dialogContentHeight + "px";
    }
  },
  mounted() {
    window.addEventListener("message", this.receiveMessage, false);
    this.$root.$on('show::PreviewVideoAnalyseDialog', (opt) => {
      this.isLoading = true;
      this.calcHeight();
      this.dialog = true;
      this.download_url = opt.item.download_url;
      this.item = opt.item;
      this.fileType = opt.fileType;
      this.title = this.item.name;
      this.analyseVideo();
    });
  },
  destroyed() {
    window.removeEventListener("message", this.receiveMessage);
    this.$root.$off('show::PreviewVideoAnalyseDialog');
  },
  watch: {
    dialog(val){
      if(val){
        this.$root.$on('window::resize', this.calcHeight);
      }
      else{
        this.$root.$off('window::resize', this.calcHeight);
        this.videoFrame.src = "";
      }
    }
  },
  methods: {
    sendMessage (action, data) {
      var sendInfo = { action: action, data: data }
      this.videoFrame.contentWindow.postMessage(JSON.stringify(sendInfo), '*');
    },
    receiveMessage(e){
      var res;
      try{
        res = JSON.parse(e.data);
      }
      catch(e){
        return ;
      }
      switch(res.action){
        case 'message.onload':
          if(Object.keys(this.videoConfig).length > 0){
            if(this.title.split(".")[0].endsWith("1")){
              this.sendMessage("setTabShow", [true, false, true, true, true]);
            }
            else if(this.title.split(".")[0].endsWith("2")){
              this.sendMessage("setTabShow", [false, true, true, true, true]);
            }
            else{
              this.sendMessage("setTabShow", [true, true, true, true, true]);
            }
            this.sendMessage("setVideoConfig", this.videoConfig);
            this.videoConfig = {};
          }
          if(!this.analyseSwitch){
            this.sendMessage("setAnalyseSwitch", this.analyseSwitch);
          }
          if(Object.keys(this.analyseConfig).length > 0){
            this.sendMessage("setAnalyseConfig", this.analyseConfig);
            this.analyseConfig = {};
          }
          this.isLoading = false;
        case 'message.error':
          // your code   
          break;
      }
    },
    openDownloadUrl(){
      window.open(this.download_url);
    },
    close(){
      this.dialog = false;
    },
    parse(params){
      return Object.keys(params).map((key) => {
        return `${key}=${params[key]}`;
      }).join("&");
    },
    async checkFinish(){
      while(true){
        await delay(10000);
        if(!this.dialog){
          return ;
        }
        try {
          var analyseResult = await Files.videoAnalyseStsToken(this.type, this.driveOrShareId, this.item.path, {
            ignoreError: true
          });
          this.analyseConfig.url = analyseResult.url.replace(/(\/*$)/g,'');
          this.analyseConfig.accessKeyId = analyseResult.access_key_id;
          this.analyseConfig.accessKeySecret = analyseResult.access_key_secret;
          this.analyseConfig.stsToken = analyseResult.security_token;
          this.analyseConfig.region = analyseResult.region;
          this.analyseConfig.bucket = analyseResult.bucket;
          if(Object.keys(this.analyseConfig).length > 0){
            this.sendMessage("setAnalyseConfig", this.analyseConfig);
          }
          return ;
        } catch (e) {
          
        }
      }
    },
    async analyseVideo() {
      var analyseResult, videoResult;
      try {
        videoResult = await Files.getStsToken(this.type, this.driveOrShareId, this.item.path, {
          token_type: "download"
        });
        this.videoConfig.url = videoResult.url;
        this.videoConfig.accessKeyId = videoResult.access_key_id;
        this.videoConfig.accessKeySecret = videoResult.access_key_secret;
        this.videoConfig.stsToken = videoResult.security_token;
        this.videoConfig.region = videoResult.region;
        this.videoConfig.bucket = videoResult.bucket;
      } catch (e) {

      }
      try {
        analyseResult = await Files.videoAnalyseStsToken(this.type, this.driveOrShareId, this.item.path, {
          ignoreError: true
        });
        this.analyseConfig.url = analyseResult.url;
        this.analyseConfig.accessKeyId = analyseResult.access_key_id;
        this.analyseConfig.accessKeySecret = analyseResult.access_key_secret;
        this.analyseConfig.stsToken = analyseResult.security_token;
        this.analyseConfig.region = analyseResult.region;
        this.analyseConfig.bucket = analyseResult.bucket;
        //this.analyseConfig.meta = analyseResult.meta;
      } catch (e) {
        if(e.statusText == "Not Found"){
          this.checkFinish();
        }
        else{
          this.analyseSwitch = false;
        }
      }
      // var url = `${Global.endpoint}/office_preview/index.html?${this.parse(params)}`;
      var url = `${Global.video_analyse_url}`
      this.videoFrame.src = url;
    },
    calcHeight(){
      this.dialogContentHeight = document.documentElement.clientHeight - 200;
    }
  }
}
</script>
<style scoped>

</style>

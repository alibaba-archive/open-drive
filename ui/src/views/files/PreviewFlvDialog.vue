<template>
  <v-dialog v-model="dialog" fullscreen>
    <v-card dark>
      <v-toolbar dense>
        <v-toolbar-title>
          <v-icon class="red--text">fa-file-o</v-icon>
          <small>{{ title }}</small>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <DownloadButton :driveId="driveOrShareId" :type="type" :item="item" @done="dialog=false"></DownloadButton>
        <v-btn icon @click.stop="dialog=false"><v-icon>close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text class="text-xs-center pa-1">
        <div class="video-container" ref="videoContainer">
          <video ref="flv" :style="{width: videoWidth, height: videoHeight}"></video>
        </div>
        <v-toolbar flat dense class="bottom-bar">
          <v-btn icon v-if="!playing" @click="play()"><v-icon>play_arrow</v-icon></v-btn>
          <v-btn icon v-if="playing" @click="pause()"><v-icon>pause</v-icon></v-btn>
          <small>{{ progress | formatTime }}</small>
          <small>/</small>
          <small>{{ totalSec | formatTime }}</small>
          <v-slider
              v-model="progress"
              :min="0"
              :max="totalSec"
              class="volume-slider-custom">
          </v-slider>
        </v-toolbar>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Files from '@/services/files.js'
// import flvjs from 'flv.js'

import DownloadButton from './DownloadButton'

export default {
  props: ['type','driveOrShareId'],
  data() {
    return {
      dialog: false,
      title: "",
      download_url: "",
      item: {},
      flvPlayer: null,
      playing: true,
      totalSec: 0,
      progress: 0,
      rafInstance: null,
      width: 300,
      height: 200
    }
  },
  computed: {
    videoWidth() {
      return this.width + "px";
    },
    videoHeight() {
      return this.height + "px";
    }
  },
  mounted() {
    this.$root.$on('show::PreviewFlvDialog', (opt) => {
      this.calcSize();
      this.dialog = true;
      this.title = opt.item.name;
      this.item = opt.item;
      this.download_url = opt.item.download_url;
      if (flvjs.isSupported()) {
        this.flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: this.download_url //'http://fms.cntv.lxdns.com/live/flv/channel96.flv'
        });
        this.flvPlayer.attachMediaElement(this.$refs.flv);
        this.flvPlayer.load();
        this.play();
        this.flvPlayer.on(flvjs.Events.STATISTICS_INFO, () => {
          this.totalSec = this.flvPlayer.duration;
        });
      }
    });
  },
  destroyed() {
    this.$root.$off('show::PreviewFlvDialog');
    if(this.flvPlayer){
      this.flvPlayer.unload();
      this.flvPlayer = null;
    }
  },
  watch: {
    dialog(val){
      if(!val){
        if(this.flvPlayer){
          this.flvPlayer.unload();
          this.flvPlayer = null;
        }
      }
    }
  },
  methods: {
    calcSize(){
      this.width = document.documentElement.clientWidth * 0.7;
      this.height = document.documentElement.clientHeight - 250;
    },
    openDownloadUrl(){
      window.open(this.download_url)
    },
    play(){
      this.playing = true;
      this.flvPlayer.play();
      this.rafInstance = requestAnimationFrame(this.step.bind(this));
    },
    pause(){
      this.playing = false;
      this.flvPlayer.pause();
    },
    step() {
      this.progress = Math.round(this.flvPlayer.currentTime) || 0;
      if (this.playing) {
        this.rafInstance = requestAnimationFrame(this.step.bind(this));
      }
      else{
        this.rafInstance = null;
      }
    }
  },
  components: {
    DownloadButton
  },
  filters: {
    formatTime: function(secs) {
      secs = Math.round(secs);
      var minutes = Math.floor(secs / 60) || 0;
      var seconds = (secs - minutes * 60) || 0;

      return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }
  }
}
</script>
<style scoped>
.bottom-bar{
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(43, 51, 63, 0.7);
}
.video-container{
  margin-bottom: 48px;
}
</style>

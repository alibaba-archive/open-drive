<template>
<v-dialog v-model="dialog" fullscreen>
  <v-card dark>
    <v-toolbar flat dense>
      <v-toolbar-title>
        <v-icon class="red--text">fa-file-o</v-icon>
        <small>{{ title }}</small>
        <v-progress-circular indeterminate :size="25" style="vertical-align: middle;" color="white" v-if="loading">
        </v-progress-circular>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <DownloadButton :driveId="driveOrShareId" :type="type" :item="item" @done="dialog=false"></DownloadButton>
      <v-btn icon @click.stop="dialog=false"><v-icon>close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text class="text-xs-center pa-1" :style="{height: height}" style="overflow: auto">
      <div class="box">
        <div class="title">{{ title }}</div>

        <!-- Progress -->
        <div class="waveform" ref="waveform" :style="{display: playing ? 'block' : 'none'}"></div>
        <div class="bar"></div>

        <v-toolbar flat dense class="bottom-bar">
            <div style="width: 150px; margin: 0;">
              <v-slider
                  v-model="volume"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  class="volume-slider-custom"
                  @click:prepend="muteToggle" 
                  :prepend-icon="volume == 0 ? 'volume_off' : 'volume_up'">
              </v-slider>
            </div>
            <div>
              <v-btn icon v-if="!playing" @click="play()"><v-icon>play_arrow</v-icon></v-btn>
              <v-btn icon v-if="playing" @click="pause()"><v-icon>pause</v-icon></v-btn>
              <small>{{ progress | formatTime }}</small>
              <small>/</small>
              <small>{{ totalSec | formatTime }}</small>
            </div>
            <v-slider
                v-if="!$vuetify.breakpoint.xsOnly"
                @mousedown="mousedown()"
                @mouseup="mouseup()"
                v-model="progress"
                :min="0"
                :max="totalSec"
                class="volume-slider-custom">
            </v-slider>

        </v-toolbar>
      </div>
    </v-card-text>
  </v-card>
</v-dialog>
</template>
<script>

import Files from '@/services/files.js'
import DownloadButton from './DownloadButton'
import {Howl, Howler} from 'howler';

export default {
  props: ['type','driveOrShareId'],
  components:{
    DownloadButton
  },
  data() {
    return {
      dialog: false,
      dialogContentHeight: 300,
      title: "",
      item: {},
      fileType: "",
      loading: true,
      sound: null,
      volume: 0.5,
      tempVolume: 0.5,
      progress: 0,
      playing: false,
      totalSec: 0,
      seeking: false,
      needSeek: false,
      wave: null
    }
  },
  computed: {
    height(){
      return this.dialogContentHeight + "px";
    }
  },
  mounted() {
    this.$root.$on('show::PreviewAudioDialog', (item) => {
      this.calcHeight();
      this.item = item.item;
      this.fileType = item.fileType;
      this.dialog = true;
      this.title = this.item.name;
      this.loadAudio();
    });
  },
  destroyed(){
    this.$root.$off('show::PreviewAudioDialog');
    if(this.sound){
      this.sound.unload();
      this.sound = null;
    }
  },
  methods: {
    calcHeight(){
      this.dialogContentHeight = document.documentElement.clientHeight - 50;
    },
    loadAudio(){
      this.sound = new Howl({
        src: [this.item.download_url],
        format: [this.fileType],
        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        onload: () => {
          this.totalSec = Math.round(this.sound.duration());
          this.loading = false;
        },
        onend: () => {
          this.playing = false;
        }
      });
      if(!this.wave){
        this.wave = new SiriWave({
          container: this.$refs.waveform,
          width: this.$refs.waveform.clientWidth,
          height: this.$refs.waveform.clientHeight,
          cover: true,
          speed: 0.03,
          amplitude: 0.7,
          frequency: 2
        });
        this.wave.start();
      }
    },
    play(){
      this.playing = true;
      if(this.needSeek){
        this.needSeek = false;
        this.sound.seek(this.progress);
      }
      this.sound.play();
      requestAnimationFrame(this.step.bind(this));
    },
    pause(){
      this.playing = false;
      this.sound.pause();
    },
    step() {
      if(!this.sound){
        return ;
      }
      if(this.seeking){
        requestAnimationFrame(this.step.bind(this));
        return ;
      }
      if(this.needSeek){
        this.needSeek = false;
        this.sound.seek(this.progress);
      }
      this.progress = Math.round(this.sound.seek()) || 0;
      if (this.playing) {
        requestAnimationFrame(this.step.bind(this));
      }
    },
    mousedown(){
      this.seeking = true;
    },
    mouseup(){
      this.seeking = false;
      this.needSeek = true;
    },
    muteToggle(){
      if(this.volume){
        this.tempVolume = this.volume;
        this.volume = 0;
      }
      else{
        this.volume = this.tempVolume;
      }
    }
  },
  watch: {
    volume(val){
      Howler.volume(val);
    },
    dialog(val){
      if(val){
        this.$root.$on('window::resize', this.calcHeight);
      }
      else{
        this.$root.$off('window::resize', this.calcHeight);
        this.playing = false;
        this.progress = 0;
        this.title = "";
        this.item = {};
        this.fileType = "";
        this.loading = true;
        this.volume = 0.5;
        this.tempVolume = 0.5;
        this.progress = 0;
        this.playing = false;
        this.totalSec = 0;
        this.seeking = false;
        this.needSeek = false;
        if(this.sound){
          this.sound.unload();
          this.sound = null;
        }
      }
    }
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
.box{
  position: relative;
  padding: 0;
  margin: 0;
  overflow: hidden;
  height: 100%;
  background: #bb71f3;
  background: -moz-linear-gradient(-45deg, #bb71f3 0%, #3d4d91 100%);
  background: -webkit-linear-gradient(-45deg, #bb71f3 0%, #3d4d91 100%);
  background: linear-gradient(135deg, #bb71f3 0%, #3d4d91 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#bb71f3', endColorstr='#3d4d91', GradientType=1);
  font-family: "Helvetica Neue", "Futura", "Trebuchet MS", Arial;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
}
/* Top Info */
.title {
  position: absolute;
  width: 100%;
  top: 3%;
  line-height: 34px;
  height: 34px;
  text-align: center;
  font-size: 34px;
  opacity: 0.9;
  font-weight: 300;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.33);
}

/* Progress */
.waveform {
  width: 100%;
  height: 30%;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 48px;
  right: 0;
  margin: auto 0;
  display: none;
  opacity: 0.8;
  -webkit-user-select: none;
  user-select: none;
}
.waveform:hover {
  opacity: 1;
}
.bar{
  width: 100%;
  height: 0px;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 48px;
  right: 0;
  margin: auto 0;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}
.progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 0%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  z-index: -1;
}

.bottom-bar{
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(43, 51, 63, 0.7);
}
</style>
<style>
.volume-slider-custom {
  padding: 10px !important;
}
.volume-slider-custom .slider {
  margin-left: 10px !important;
}
.volume-slider-custom .input-group__details {
  display: none;
}
</style>

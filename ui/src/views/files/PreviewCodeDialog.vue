<template>
  <v-dialog v-model="dialog" fullscreen>
    <v-card dark>
      <v-toolbar dense>
        <v-toolbar-title>
          <v-icon class="red--text">fa-file-o</v-icon>
          <small>{{ title }}</small>
          <v-progress-circular indeterminate :size="25" style="vertical-align: middle;" color="white" v-if="loading">
          </v-progress-circular>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <DownloadButton :driveId="driveOrShareId" :type="type" :item="item" @done="dialog=false"></DownloadButton>
        <v-btn icon @click.stop="close()"><v-icon>close</v-icon></v-btn>
      </v-toolbar>
      <v-card-text class="text-xs-center pa-1" :style="{height: height}">
        <div style="text-align: left; height: 100%;overflow: auto;">
          <!-- <pre v-highlightjs="data.code" v-if="!isChangedStatus"><code class="javascript"></code></pre> -->
          <codemirror
            v-if="delayLoad && !showDiff"
            v-model="data.changedCode"
            :options="editorOption"
            ref="myEditor"
            @change="codeChangeDebounce">
          </codemirror>
          <pre ref="diffPanel" if="showDiff"></pre>
        </div>
      </v-card-text>
      <v-card-actions class="grey darken-4">
        <v-spacer></v-spacer>
        <!-- <v-btn color="success" @click="findDiff()" v-if="showDiff">查找下一处</v-btn> -->
        <v-btn color="success" @click="diffBack()" v-if="showDiff">继续修改</v-btn>
        <v-btn color="success" @click="diff()" v-if="!isReadonly && !showDiff" :disabled="loading || !isChanged">Diff</v-btn>
        <v-btn color="success" @click="close()">关闭</v-btn>
        <v-btn v-if="!isReadonly" color="success" @click="save()" :disabled="loading || !isChanged">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from 'vue'
import _ from 'underscore'
import http from '@/services/http.js'
var JsDiff = require('diff');
// import VueHighlightJS from 'vue-highlightjs'
import { codemirror } from 'vue-codemirror-lite'

require('@/services/codemirror-mode')

// import 'highlight.js/styles/ocean.css'

import Files from '@/services/files'
import DownloadButton from './DownloadButton'

const OFFSET_K = -55;

export default {
  props: ['type','driveOrShareId'],
  components: {
    codemirror,
    DownloadButton
  },
  data() {
    return {
      delayLoad: false,
      showDiff: false,
      dialogContentHeight: 300,
      diffList: [],
      editorOption: {
        mode: "javascript",
        theme: "oceanic-next",
        lineNumbers: true,
        readOnly: false,
        lineWrapping: true
      },
      title: "",
      dialog: false,
      loading: false,
      isReadonly: false,
      download_url: "",
      isChanged: false,
      data: {
        type: "",
        code: "",
        changedCode: ""
      },
      item: {},
    }
  },
  computed: {
    diffPanel(){
      return this.$refs.diffPanel;
    },
    scrollElm(){
      return this.diffPanel.parentElement.parentElement;
    },
    height(){
      return this.dialogContentHeight + "px";
    }
  },
  mounted() {
    this.codeChangeDebounce = _.debounce(this.codeChange, 500);
    this.$root.$on('show::PreviewCodeDialog', (opt) => {
      this.calcHeight();
      this.editorOption.mode = opt.mode.mode || "javascript";
      this.title = opt.mode.name + "文件";
      this.dialog = true;
      this.download_url = opt.item.download_url;
      this.item = opt.item;
      this.isReadonly = opt.isReadonly;
      this.loadCode(this.download_url);
      this.isChanged = false;
    });
  },
  destroyed() {
    this.$root.$off('show::PreviewCodeDialog');
  },
  watch: {
    dialog(val){
      if(val){
        this.$root.$on('window::resize', this.calcHeight);
      }
      else{
        this.$root.$off('window::resize', this.calcHeight);
        this.data.code = "";
        this.data.changedCode = "";
        this.delayLoad = false;
        this.showDiff = false;
        this.diffPanel.innerHTML = "";
        this.diffList = [];
      }
    }
  },
  methods: {
    openDownloadUrl(){
      window.open(this.download_url)
    },
    codeChange(val){

      var diff = JsDiff.diffLines(this.data.code, val);
      this.isChanged = diff.length > 1;
    },
    close(){
      this.dialog = false;
    },
    diff(){
      var diff = JsDiff.diffLines(this.data.code, this.data.changedCode);
      var diffDom = this.getDiffDom(diff);
      this.diffPanel.appendChild(diffDom);
      this.showDiff = true;
    },
    diffBack(){
      this.diffPanel.innerHTML = "";
      this.showDiff = false;
      this.diffList = [];
    },
    findDiff(){
      var currentTop = this.scrollElm.scrollTop;
      var index = 0;

      while(index < this.diffList.length && this.diffList[index].offsetTop + OFFSET_K <= currentTop){
        index ++;
      }

      if(index < this.diffList.length){
        this.scrollElm.scrollTop = this.diffList[index].offsetTop + OFFSET_K;
      }
      else{
        //this.scrollElm.scrollTop = this.diffList[0].offsetTop + OFFSET_K;
      }
    },
    async save(){
      this.loading = true;
      try{
        await Files.putFile(this.type, this.driveOrShareId, this.item, new Buffer(this.data.changedCode));
      }catch(e){
        console.error(e)
        this.loading = false;
        return ;
      }
      this.loading = false;
      this.dialog = false;
      Toast.success('保存成功');
    },
    getDiffDom(diff) {
    	var fragment = document.createDocumentFragment();
    	for (var i=0; i < diff.length; i++) {
    		if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
    			var swap = diff[i];
    			diff[i] = diff[i + 1];
    			diff[i + 1] = swap;
    		}
    		var node;
    		if (diff[i].removed) {
    			node = document.createElement('del');
    			node.appendChild(document.createTextNode(diff[i].value));
          this.diffList.push(node);
    		} else if (diff[i].added) {
    			node = document.createElement('ins');
    			node.appendChild(document.createTextNode(diff[i].value));
          this.diffList.push(node);
    		} else {
    			node = document.createTextNode(diff[i].value);
    		}
    		fragment.appendChild(node);
    	}
    	return fragment;
    },
    async loadCode(url){
      var result;
      this.loading = true;
      try {
        result = await http.get(url, undefined, {
          dataType: "text"
        });
      } catch (e) {
        this.data.code = "load error";
        this.loading = false;
        return ;
      }
      this.data.code = result;
      this.data.changedCode = result;
      setTimeout(() => {
        this.delayLoad = true;
        this.loading = false;
      }, 500);
    },
    calcHeight(){
      this.dialogContentHeight = document.documentElement.clientHeight - 100;
    }
  }
}
</script>
<style>
.CodeMirror{
  height: 100% !important;
}
.CodeMirror-code {
  font-family: monospace,monospace !important;
}
pre {
	white-space: pre;
}
del {
	text-decoration: none;
	color: #b30000;
	background: #fbb2ab;
}
ins {
	background: #b9f583;
	color: #406619;
	text-decoration: none;
}
</style>

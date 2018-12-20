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
        <v-btn icon @click.stop="close()">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="text-xs-center pa-0" :style="{height: height}">
        <section v-if="error_message">
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
            <v-btn @click="openDownloadUrl()">下载</v-btn>
          </div>
        </section>
        <div v-else style="text-align: left; height: 100%;overflow: auto;">
          <iframe id="aliyunPreview" frameborder="0" ref="docFrame" width="100%" height="100%"></iframe>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Vue from "vue";
import _ from "underscore";
import Files from "@/services/files";
import DownloadButton from "./DownloadButton";
import F from '@/services/f'
export default {
  components: {
    DownloadButton
  },
  props: ["type", "driveOrShareId"],
  data() {
    return {
      F,
      title: "",
      dialog: false,
      loading: false,
      dialogContentHeight: 300,
      download_url: "",
      fileType: "",
      item: {},
      error_message: null
    };
  },
  computed: {
    docFrame() {
      return this.$refs.docFrame;
    },
    height() {
      return this.dialogContentHeight + "px";
    }
  },
  mounted() {
    this.$root.$on("show::PreviewDocDialog", opt => {
      this.calcHeight();
      this.dialog = true;
      this.download_url = opt.item.download_url;
      this.item = opt.item;
      this.fileType = opt.fileType;
      this.title = this.item.name;
      this.loadDoc();
    });
  },
  destroyed() {
    this.$root.$off("show::PreviewDocDialog");
  },
  watch: {
    dialog(val) {
      if (val) {
        this.$root.$on("window::resize", this.calcHeight);
      } else {
        this.$root.$off("window::resize", this.calcHeight);
        if(this.docFrame)this.docFrame.src = "";
      }
    }
  },
  methods: {
    openDownloadUrl() {

      if(window.isElectron){
        this.$root.$emit('showElectronDownloadDialog',{
          items: [this.item]
        });
      }else{
        window.open(this.download_url);
      }

    },
    close() {
      this.dialog = false;
    },
    parse(params) {
      return Object.keys(params)
        .map(key => {
          return `${key}=${params[key]}`;
        })
        .join("&");
    },
    async loadDoc() {
      var result;
      // if(this.$root.userInfo.nick_name){
      //   result = await Files.getOfficePreviewStsToken(this.type, this.driveOrShareId, this.item.path);
      // }
      // else{
      //   result = await Files.getPublicOfficePreviewStsToken(this.type, this.driveOrShareId, this.item.path);
      // }
      try {
        result = await Files.getOfficePreviewStsToken(
          this.type,
          this.driveOrShareId,
          this.item.path,
          { ignoreError: true }
        );
      } catch (e) {
        //console.log(e);
        this.error_message = "未开通";
        return;
      }
      var params = {};
      params.url = result.url.replace(/(\/*$)/g, "");
      params.accessKeyId = result.access_key_id;
      params.accessKeySecret = result.access_key_secret;
      params.stsToken = encodeURIComponent(result.security_token);
      params.region = result.region;
      params.bucket = result.bucket;
      // var url = `${Global.endpoint}/office_preview/index.html?${this.parse(params)}`;
      var url = `${Global.office_preview_url}?${this.parse(params)}`;
      this.docFrame.src = url;
    },
    calcHeight() {
      this.dialogContentHeight = document.documentElement.clientHeight - 48;
    },
  }
};
</script>
<style scoped>
</style>

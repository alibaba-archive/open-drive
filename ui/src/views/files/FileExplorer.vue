<template>

  <v-card>

    <v-toolbar v-if="driveInfo" dense flat dark class="address-bar">
      <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->
      <v-tooltip bottom>后退
        <v-btn slot="activator" disabled small icon>
          <v-icon>arrow_back</v-icon>
        </v-btn>
      </v-tooltip>
      <v-tooltip bottom>向上
        <v-btn slot="activator" :disabled="sch.dir_path=='/'" small icon @click="goUp">
          <v-icon>arrow_upward</v-icon>
        </v-btn>
      </v-tooltip>
      <v-tooltip bottom>前进
        <v-btn slot="activator" disabled small icon>
          <v-icon>arrow_forward</v-icon>
        </v-btn>
      </v-tooltip>

      <v-text-field v-model="sch.dir_path" solo flat hide-details small @keyup.enter="addressGo" row-height="16px" single-line append-icon="refresh" @click:append="refresh"></v-text-field>

      <v-tooltip bottom>搜索(暂未开放) 
        <v-btn slot="activator" disabled icon color="primary">
          <v-icon>search</v-icon>
        </v-btn>
      </v-tooltip>

      <v-tooltip v-if="!isReadonly" class="hidden-xs-only" bottom>新建目录
        <v-btn slot="activator" icon color="success" @click.stop="showAddFolder">
          <v-icon>create_new_folder</v-icon>
        </v-btn>
      </v-tooltip>

      <v-tooltip v-if="!isReadonly" class="hidden-xs-only" bottom>上传目录
        <div v-if="!isElectron" slot="activator" icon class="success upload-btn">
          <v-icon>file_upload</v-icon>
          <input type="file" @change="onFileChange" webkitdirectory directory class="file-input">
        </div>

        <div v-else slot="activator" icon class="success upload-btn" @click="showElectronUploadDirectoryDialog">
          <v-icon>file_upload</v-icon>
        </div>
      </v-tooltip>

      <v-tooltip v-if="!isReadonly" class="hidden-xs-only" bottom>上传文件
        <div slot="activator" icon class="success upload-btn">
          <v-icon>cloud_upload</v-icon>
          <input type="file" @change="onFileChange" multiple class="file-input">
        </div>

      </v-tooltip>

      <v-tooltip v-if="isElectron" top>下载
        <v-btn :disabled="hasSel.length==0" slot="activator" icon :color="hasSel.length==0?'grey':'success'" @click.stop="downloadFiles">
          <v-icon>file_download</v-icon>
        </v-btn>
      </v-tooltip>

      <v-tooltip class="hidden-xs-only" bottom>全选/全不选
        <v-btn slot="activator" icon :color="hasSel.length>0 && hasSel.length==items.length?'info lighten-4':'grey'" @click.stop="toggleSelectAll()">
          <v-icon v-if="hasSel.length>0 && hasSel.length==items.length">check_box</v-icon>
          <v-icon v-if="hasSel.length!=items.length">check_box_outline_blank</v-icon>
        </v-btn>
      </v-tooltip>

    </v-toolbar>
    <LoadingBar v-if="loading" class="ma-0"></LoadingBar>

    <v-card-text class="pa-1">

      <DropZone @drop="handleDrop" :style="'overflow:auto;height:'+height+'px'" @atbottom="hitBottom">

        <v-container v-if="!loading && items.length>0" fluid grid-list-xs class="pa-1 hidden-sm-and-down">

          <v-layout wrap style="justify-content:left">
            <v-flex v-for="(item,$index) in items" :key="$index" xs12 sm4 md3 lg2 xl1>

              <div class="file-item pl-2" style="user-select: none" :class="item.selected?'blue lighten-3':''" @dblclick.prevent.stop="dblClickItem(item)" @click.prevent.stop="clickItem($event,item, $index)">
                <v-layout row wrap>
                  <v-flex xs2 sm3 class="headline">
                    <v-icon v-if="item.type=='folder'" class="orange--text">fa-folder</v-icon>
                    <template v-if="item.type=='file'">

                      <img v-if="item.status.toLowerCase()=='normal' && isImage(item)" :src="item.image_snap_url || item.download_url" style="width:32px;height:32px;margin:2px;" />
                      <v-icon v-else :class="item.status=='uploading'?'grey--text':''">{{getFileIcon(item)}}</v-icon>

                    </template>
                  </v-flex>
                  <v-flex xs10 sm9 :class="item.status=='uploading'?'grey--text':''">
                    <v-tooltip top>{{item.name}}
                      <div slot="activator" class="truncate">{{item.name}}</div>
                    </v-tooltip>
                    <div class="grey--text">{{item.type=='folder'?'目录':F.sizeFormat(item.size)}}</div>
                  </v-flex>
                </v-layout>

              </div>

            </v-flex>
            <div class="hidden-md-and-up" style="height:100px">
              <!-- 占位符 -->
            </div>

          </v-layout>

        </v-container>

        <v-list class="hidden-md-and-up" subheader v-if="!loading && items.length>0">
          <template v-for="(item,$index) in items">
          <v-list-tile :key="'m-'+$index" avatar @click.prevent.stop="clickItem($event,item, $index)"
          :class="item.selected?'blue lighten-3':''">
            <v-list-tile-avatar>
              <v-icon v-if="item.type=='folder'" class="orange--text">fa-folder</v-icon>
              <template v-if="item.type=='file'">

                <img v-if="item.status.toLowerCase()=='normal' && isImage(item)" :src="item.image_snap_url || item.download_url" style="width:32px;height:32px;margin:2px;" />
                <v-icon v-else :class="item.status=='uploading'?'grey--text':''">{{getFileIcon(item)}}</v-icon>

              </template>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{item.name}}</v-list-tile-title>
              <v-list-tile-sub-title class="grey--text">{{item.type=='folder'?'目录':F.sizeFormat(item.size)}}</v-list-tile-sub-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-btn icon ripple @click.prevent.stop="dblClickItem(item)">
                <v-icon color="info">forward</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
          <v-divider 
              :key="'d-'+$index"
            ></v-divider>
            </template>
        </v-list>

        <Nodata v-if="!loading && items.length==0"></Nodata>
        <Loading v-if="loading2" :height="30" :size="20"></Loading>

      </DropZone>

    </v-card-text>

    <!-- 悬浮工具按钮  -->

    <!-- 非选中工具条 -->
    <v-speed-dial v-if="!isReadonly && hasSel.length==0 && keepSel.length==0" v-model="fab" dark fab bottom right fixed direction="top" class="responsive-speed-dial" transition="slide-y-reverse-transition">

      <v-btn slot="activator" class="blue darken-2" dark fab hover v-model="fab">
        <v-icon>add</v-icon>
        <v-icon>close</v-icon>
      </v-btn>

      <v-tooltip left>新建目录
        <v-btn slot="activator" fab dark small color="success" @click.stop="showAddFolder">
          <v-icon>create_new_folder</v-icon>
        </v-btn>
      </v-tooltip>

      <v-tooltip left>上传目录
        <div v-if="!isElectron" slot="activator" fab dark small class="success upload-btn">
          <v-icon class="white--text">file_upload</v-icon>
          <input type="file" @change="onFileChange" webkitdirectory directory class="file-input">
        </div>
        <div v-else slot="activator" icon class="success upload-btn" @click="showElectronUploadDirectoryDialog">
          <v-icon class="white--text">file_upload</v-icon>
        </div>
      </v-tooltip>

      <v-tooltip left>上传文件
        <div slot="activator" fab dark small class="success upload-btn">
          <v-icon class="white--text">cloud_upload</v-icon>
          <input type="file" @change="onFileChange" multiple class="file-input">
        </div>
      </v-tooltip>

      <v-tooltip class="hidden-sm-and-up" left>全选/全不选
        <v-btn slot="activator" fab dark small :color="hasSel.length>0 && hasSel.length==items.length?'info lighten-4':'grey'" @click.stop="toggleSelectAll()">
          <v-icon v-if="hasSel.length>0 && hasSel.length==items.length">check_box</v-icon>
          <v-icon v-if="hasSel.length!=items.length">check_box_outline_blank</v-icon>
        </v-btn>
      </v-tooltip>

    </v-speed-dial>

    <!-- 选中工具条 -->
    <v-speed-dial v-if="!isReadonly && hasSel.length>0 && keepSel.length==0" :value="fab2" dark fab bottom right fixed direction="top" class="responsive-speed-dial" transition="slide-y-reverse-transition">

      <v-btn slot="activator" class="blue darken-2" dark fab hover v-model="fab2">
        <v-icon>add</v-icon>
        <v-icon>close</v-icon>
      </v-btn>

      <v-tooltip v-if="type!='share'||driveInfo.privilege=='grantable'" left>创建共享目录
        <v-btn slot="activator" fab dark small :color="(hasSel.length==1 && hasSel[0].type=='folder')?'purple':'grey'" @click.stop="showAddShare">
          <v-icon>link</v-icon>
        </v-btn>
      </v-tooltip>

      <v-tooltip left>删除
        <v-btn :disabled="hasSel.length==0" slot="activator" fab dark small :color="hasSel.length==0?'grey':'error'" @click.stop="showDeleteFiles()">
          <v-icon>close</v-icon>
        </v-btn>
      </v-tooltip>

      <v-tooltip left>剪切
        <v-btn :disabled="hasSel.length==0" v-if="keepSel.length==0" slot="activator" @click.stop="showMove" fab dark small :color="hasSel.length==0?'grey':'info'">
          <v-icon>content_cut</v-icon>
        </v-btn>
      </v-tooltip>

      <v-tooltip v-if="isSelectedFilesStatusNormal" left>复制
        <v-btn :disabled="hasSel.length==0" v-if="keepSel.length==0" slot="activator" @click.stop="showCopy" fab dark small :color="hasSel.length==0?'grey':'info'">
          <v-icon>content_copy</v-icon>
        </v-btn>
      </v-tooltip>

      <v-tooltip left>重命名
        <v-btn :disabled="hasSel.length==0" v-if="hasSel.length==1" slot="activator" @click.stop="rename" fab dark small :color="hasSel.length==0?'grey':'info'">
          <v-icon>create</v-icon>
        </v-btn>
      </v-tooltip>

      <v-tooltip class="hidden-sm-and-up" left>全选/全不选
        <v-btn slot="activator" fab dark small :color="hasSel.length>0 && hasSel.length==items.length?'info lighten-4':'grey'" @click.stop="toggleSelectAll()">
          <v-icon v-if="hasSel.length>0 && hasSel.length==items.length">check_box</v-icon>
          <v-icon v-if="hasSel.length!=items.length">check_box_outline_blank</v-icon>
        </v-btn>
      </v-tooltip>

    </v-speed-dial>

    <!-- 粘贴工具条 -->
    <v-speed-dial v-if="keepSel.length>0" :value="fab3" dark fab bottom right fixed direction="top" class="responsive-speed-dial" transition="slide-y-reverse-transition">

      <v-btn slot="activator" class="blue darken-2" dark fab hover v-model="fab3" @click="restorePaste()">
        <v-icon>add</v-icon>
        <v-icon>close</v-icon>
      </v-btn>

      <v-tooltip left>粘贴
        <v-btn :class="fromPath==sch.dir_path?'grey':'blue'" slot="activator" fab dark small @click.stop="showPaste()">
          <v-icon>content_paste</v-icon>
        </v-btn>
      </v-tooltip>

    </v-speed-dial>
    <!-- 悬浮工具按钮 end  -->

    <CreateDriveDialog></CreateDriveDialog>
    <CreateShareDialog></CreateShareDialog>
    <AddFolderDialog></AddFolderDialog>

    <DeleteFilesDialog></DeleteFilesDialog>
    <PasteFilesDialog></PasteFilesDialog>

    <RenameDialog></RenameDialog>

    <PreviewImageDialog></PreviewImageDialog>
    <PreviewVideoDialog :type="type" :driveOrShareId="driveOrShareId"></PreviewVideoDialog>
    <PreviewCodeDialog :type="type" :driveOrShareId="driveOrShareId"></PreviewCodeDialog>
    <PreviewDocDialog :type="type" :driveOrShareId="driveOrShareId"></PreviewDocDialog>
    <PreviewAudioDialog :type="type" :driveOrShareId="driveOrShareId"></PreviewAudioDialog>
    <PreviewFlvDialog :type="type" :driveOrShareId="driveOrShareId"></PreviewFlvDialog>
    <PreviewOtherDialog :type="type" :driveOrShareId="driveOrShareId"></PreviewOtherDialog>
    <GenDownloadURLDialog></GenDownloadURLDialog>
    <PreviewVideoAnalyseDialog :type="type" :driveOrShareId="driveOrShareId"></PreviewVideoAnalyseDialog>
  </v-card>
</template>

<script>
import CreateDriveDialog from "./CreateDriveDialog";
import CreateShareDialog from "./CreateShareDialog";
import AddFolderDialog from "./AddFolderDialog";
import DeleteFilesDialog from "./DeleteFilesDialog";
import PasteFilesDialog from "./PasteFilesDialog";
import RenameDialog from "./RenameDialog";

import PreviewImageDialog from "./PreviewImageDialog";
import PreviewVideoDialog from "./PreviewVideoDialog";
import PreviewCodeDialog from "./PreviewCodeDialog";
import PreviewDocDialog from "./PreviewDocDialog";
import PreviewAudioDialog from "./PreviewAudioDialog";
import PreviewFlvDialog from "./PreviewFlvDialog";
import PreviewOtherDialog from "./PreviewOtherDialog";
import PreviewVideoAnalyseDialog from "./PreviewVideoAnalyseDialog";

import GenDownloadURLDialog from "./GenDownloadURLDialog";

import DropZone from "@/views/_/DropZone";

import Drives from "@/services/drives.js";
import Shares from "@/services/shares.js";
import Files from "@/services/files.js";
import F from "@/services/f.js";
import CodeMirror from "@/services/codeTypeMap.js";
import docTypeMap from "@/services/docTypeMap.js";

import { Howler } from "howler";

const ignoreHiddenFiles = false;
var tid;

export default {
  props: ["type", "driveOrShareId", "grantToUserId", "isPublic"],
  components: {
    CreateDriveDialog,
    CreateShareDialog,
    DeleteFilesDialog,
    AddFolderDialog,
    PasteFilesDialog,
    RenameDialog,

    PreviewImageDialog,
    PreviewVideoDialog,
    PreviewCodeDialog,
    PreviewDocDialog,
    PreviewAudioDialog,
    PreviewOtherDialog,
    PreviewFlvDialog,
    GenDownloadURLDialog,
    PreviewVideoAnalyseDialog,

    DropZone
  },
  data() {
    return {
      F,
      isElectron: window.isElectron,

      sch: {
        dir_path: "/",
        limit: 100,
        marker: ""
      },
      driveId: "",

      fab: false,
      fab2: true,
      fab3: true,

      endpoint: Global.endpoint,

      //driveInfo or shareInfo
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
      fromPath: "",

      height: 0
    };
  },
  computed: {
    userInfo() {
      return this.$root.userInfo;
    },
    isReadonly() {
      return (
        this.type == "share" &&
        this.driveInfo &&
        this.driveInfo.privilege == "readonly"
      );
    },
    isSelectedFilesStatusNormal() {
      return !this.items.find(o => {
        return o.selected && o.status != "normal";
      });
    }
  },
  async mounted() {
    this.driveId = this.driveOrShareId;
    this.grantTo = this.grantToUserId;

    this.$root.$on("refresh::fileList", opt => {
      this.refresh();
    });
    this.$root.$on("driveSizeChanged", () => {
      this.$emit("fileSizeChanged");
    });
    this.$root.$on("showElectronDownloadDialog", ({ items }) => {
      this.showElectronDownloadDialog(items);
    });

    //this.$emit('fileSizeChanged')

    this.$root.$on("uploadListChanged", v => {
      clearTimeout(tid);
      tid = setTimeout(() => {
        var names = [];
        for (var n of v) {
          //  console.log('check refresh', n.to.dirPath,'====', this.sch.dir_path,'<=')

          if (n.to.dirPath == this.sch.dir_path) {
            this.refresh();
            break;
          } else if (n.to.dirPath.startsWith(this.sch.dir_path)) {
            var name = n.to.dirPath
              .substring(this.sch.dir_path.length)
              .split("/", 1)[0];
            names.push(name);
          }
        }
        if (names.length > 0) {
          for (var item of this.items) {
            if (names.indexOf(item.name)) {
              this.refresh();
              break;
            }
          }
        }
      }, 600);
    });

    $(document).click(this.initDocumentClick);

    $(window).resize(this.initResize);

    this.initResize();

    this.getDriveOrShareInfo();
    this.refresh();
  },
  destroyed() {
    $(document).unbind("click", this.initDocumentClick);
    $(window).unbind("resize", this.initResize);
    this.$root.$off("refresh::fileList");
    this.$root.$off("uploadListChanged");
    this.$root.$off("driveSizeChanged");

    this.$root.$off("showElectronDownloadDialog");
  },
  watch: {
    items: {
      deep: true,
      handler: function() {
        this.hasSel = [];
        this.hasFolderSel = false;
        for (var n of this.items) {
          if (n.selected) {
            this.hasSel.push(n);
            if (n.type == "folder") this.hasFolderSel = true;
          }
        }
      }
    }
  },
  methods: {
    async getDriveOrShareInfo() {
      console.log(`get ${this.type} info`);
      if (this.$route.path.startsWith("/public/")) {
        this.driveInfo = {
          privilege: "readonly"
        };
        return;
      }

      if (this.grantTo) {
        var callFn = this.type == "drive" ? Drives.get : Shares.get;
        this.driveInfo = await callFn(this.grantTo, this.driveId);
      } else {
        var callFn = this.type == "drive" ? Drives.getMy : Shares.getMy;
        this.driveInfo = await callFn(this.driveId);
      }
    },
    initDocumentClick() {
      for (var n of this.items) {
        n.selected = false;
      }
      this.fab = false;
    },

    getFileListByDropEvent(items, fn) {
      var fileList = [];
      //var items = event.dataTransfer.items;

      for (let i2 of items) {
        let ent = i2.webkitGetAsEntry();
        if (ent) {
          traverseFileTree(ent, null, fn);
        }
      }

      return fileList;

      function traverseFileTree(item, path, partFn) {
        path = path || "";

        if (item.isFile) {
          console.log("----file:", item.name);
          // Get file
          item.file(function(file) {
            if (ignoreHiddenFiles && file.name.substring(0, 1) === ".") return;

            file._webkitRelativePath = path + file.name;
            if (partFn) partFn([file]);
          });
        } else if (item.isDirectory) {
          // Get folder contents
          console.log("----directory:", item.name);
          var dirReader = item.createReader();
          dirReader.readEntries(function(entries) {
            for (let i = 0; i < entries.length; i++) {
              traverseFileTree(entries[i], path + item.name + "/", fn);
            }
          });
        }
      }
    },

    //拖放上传
    async handleDrop(event) {
      var files = event.dataTransfer.items || event.dataTransfer.files;
      var items = [];
      //if (files.length == 0) return;
      try {
        this.getFileListByDropEvent(files, tempFiles => {
          this.$root.$emit("uploadFiles", {
            type: this.type,
            driveId: this.driveId,
            toPath: this.sch.dir_path,
            files: tempFiles
          });
        });
      } catch (e) {
        for (var i = 0; i < files.length; i++) {
          if (files[i].type !== "") {
            items.push(files[i]);
          }
        }
        if (items.length === 0) {
          Toast.error("您的浏览器不支持此操作，请使用Chrome浏览器");
          return;
        }
        this.$root.$emit("uploadFiles", {
          type: this.type,
          driveId: this.driveId,
          toPath: this.sch.dir_path,
          files: items
        });
      }
    },
    //input file 上传
    onFileChange(e) {
      var files = e.target.files;
      if (files.length == 0) return;

      // try{
      //   this.getFileListByDropEvent(files, (tempFiles)=>{
      //     this.$root.$emit('uploadFiles', {
      //       type: this.type,
      //       driveId: this.driveId,
      //       toPath: this.sch.dir_path,
      //       files: tempFiles
      //     });
      //   });
      //
      // }
      // catch(err){

      this.$root.$emit("uploadFiles", {
        type: this.type,
        driveId: this.driveId,
        toPath: this.sch.dir_path,
        files: files
      });
      //}

      //init
      setTimeout(() => {
        if (e && e.target) e.target.value = "";
      }, 5000);
    },
    pass() {},
    //Electron 点击按钮, 选择文件夹上传
    showElectronUploadDirectoryDialog() {
      ASNode.showUploadDirectoryDialog(async ps => {
        if (!ps) return;

        for (var p of ps) {
          var basePath = ASNode.path.dirname(p);
          await traverseNodeFileTree(p, basePath, files => {
            this.$root.$emit("uploadFiles", {
              type: this.type,
              driveId: this.driveId,
              toPath: this.sch.dir_path,
              files: files
            });
          });
        }
      });

      async function traverseNodeFileTree(p, basePath, eachFileFn) {
        var arr = await listFiles(p);
        for (var p2 of arr) {
          var file_path = ASNode.path.join(p, p2);
          if (ASNode.fs.statSync(file_path).isDirectory()) {
            traverseNodeFileTree(file_path, basePath, eachFileFn);
          } else {
            var st = ASNode.fs.statSync(file_path);
            var webkitRelativePath = ASNode.path.relative(basePath, file_path);
            eachFileFn([
              {
                lastModified: st.mtimeMs,
                name: p2,
                path: file_path,
                size: st.size,
                // type: "application/x-javascript"
                webkitRelativePath: webkitRelativePath,
                _webkitRelativePath: webkitRelativePath //拖拽文件夹上传时自定义的Path
              }
            ]);
          }
        }
      }
      function listFiles(p) {
        return new Promise((a, b) => {
          ASNode.fs.readdir(p, function(err, data) {
            err ? b(err) : a(data);
          });
        });
      }
    },
    showElectronDownloadDialog(items) {
      ASNode.showDownloadDialog(p => {
        if (!p) return;

        this.$root.$emit("downloadFiles", {
          type: this.type,
          driveId: this.driveId,
          dirPath: this.sch.dir_path,
          items: items,
          toPath: p[0]
        });
      });
    },
    downloadFiles() {
      if (!this.hasSel || this.hasSel.length < 1) return;
      this.showElectronDownloadDialog(this.hasSel);
    },

    hitBottom() {
      if (!this.loading2 && this.sch.marker) {
        this.list(true);
      }
    },
    getFileIcon(item) {
      switch (item.name.substring(item.name.lastIndexOf("."))) {
        default:
          return "insert_drive_file";
        case ".mp4":
          return "videocam";
      }
    },

    initResize() {
      this.height = $(window).height() - $(this.$el).offset().top - 120;
    },
    addressGo() {
      this.refresh();
    },

    async refresh() {
      //防止重复加载
      if (this.loading) return;

      this.loading = true;
      this.items = [];
      this.sch.marker = "";
      await this.list(false);
      this.loading = false;
    },
    async goIn(item) {
      this.sch.dir_path = this.sch.dir_path + item.name + "/";
      this.sch.marker = "";
      await this.refresh();
    },
    async goUp() {
      if (this.sch.dir_path == "/") return;
      var arr = this.sch.dir_path.replace(/(^\/*)|(\/*$)/g, "").split("/");
      arr.pop();
      this.sch.dir_path = arr.length == 0 ? "/" : "/" + arr.join("/") + "/";

      this.sch.marker = "";
      await this.refresh();
    },
    async list(notFirstTime) {
      var result;
      this.loading2 = notFirstTime;
      if (!notFirstTime) this.items = [];
      if (this.isPublic) {
        result = await Files.publicList(this.type, this.driveId, this.sch);
      } else {
        result = await Files.list(this.type, this.driveId, this.sch);
      }
      result.items.forEach(n => {
        n.selected = false;
      });
      this.items = this.items.concat(result.items);
      this.sch.marker = result.next_marker;
      this.loading2 = false;
      //console.log(JSON.stringify(result, ' ', 2))
    },

    toggleSelectAll() {
      if (this.items.length == this.hasSel.length) {
        for (var n of this.items) {
          n.selected = false;
        }
      } else {
        for (var n of this.items) {
          n.selected = true;
        }
      }
    },

    dblClickItem(item) {
      if (item.type == "folder") {
        this.goIn(item);
      } else {
        this.showPreview(item);
      }
    },
    clickItem(evt, item, $index) {
      if (evt.shiftKey) {
        var min = $index,
          max = this.lastClickItemIndex;
        if (this.lastClickItemIndex < $index) {
          min = this.lastClickItemIndex;
          max = $index;
        }
        for (var i = min; i <= max; i++) {
          this.items[i].selected = true;
        }
      } else item.selected = !item.selected;

      this.lastClickItemIndex = $index;
    },
    showCopy() {
      (this.fromPath = this.sch.dir_path), (this.isMove = false);
      this.keepSel = JSON.parse(JSON.stringify(this.hasSel));
    },

    showMove() {
      (this.fromPath = this.sch.dir_path), (this.isMove = true);
      this.keepSel = JSON.parse(JSON.stringify(this.hasSel));
    },

    restorePaste() {
      this.keepSel = [];
      this.fromPath = "/";
      for (var n of this.items) {
        n.selected = false;
      }
    },
    showPaste() {
      if (this.fromPath != this.sch.dir_path) {
        //显示粘贴dialog
        this.$root.$emit("show::PasteFilesDialog", {
          type: this.type,
          driveId: this.driveId,
          fromPath: this.fromPath,
          currentPath: this.sch.dir_path,
          keepSel: JSON.parse(JSON.stringify(this.keepSel)),
          isMove: this.isMove
        });
      }

      //恢复
      this.restorePaste();
    },
    rename() {
      this.$root.$emit("show::RenameDialog", {
        type: this.type,
        driveId: this.driveId,
        fromPath: this.sch.dir_path,
        currentPath: this.sch.dir_path,
        hasSel: JSON.parse(JSON.stringify(this.hasSel)),
        isMove: true
      });
    },
    async showAddDrive() {
      if (
        !this.hasSel ||
        this.hasSel.length != 1 ||
        this.hasSel[0].type != "folder"
      )
        return;

      var item = this.hasSel[0];

      this.$root.$emit("show::CreateDriveDialog", {
        item: {
          description: "",
          drive_name: item.name,
          grant_to: "",
          privilege: "readonly",
          storage_name: this.driveInfo.storage_name,
          storage_id: this.driveInfo.storage_id,
          source_path: item.path
        },
        hideSourceItems: true,
        callback: async () => {}
      });
    },
    async showAddShare() {
      if (
        !this.hasSel ||
        this.hasSel.length != 1 ||
        this.hasSel[0].type != "folder"
      )
        return;

      var item = this.hasSel[0];

      this.$root.$emit("show::CreateShareDialog", {
        item: {
          description: "",
          share_name: item.name,
          grant_to: "",
          privilege: "readonly",
          drive_id: this.driveId,
          source_path: item.path
        },
        hideSourceItems: true,
        callback: async () => {}
      });
    },

    async showAddFolder() {
      this.$root.$emit("show::AddFolderDialog", {
        driveId: this.driveId,
        type: this.type,
        item: {
          dir_path: this.sch.dir_path
        },
        callback: xitem => {
          this.refresh();
        }
      });
    },

    async showDeleteFiles() {
      if (this.hasSel.length == 0) return;

      this.$root.$emit("show::DeleteFilesDialog", {
        type: this.type,
        driveId: this.driveId,
        currentPath: this.sch.dir_path,
        hasSel: this.hasSel
      });
    },
    isImage(item) {
      return Files.isImage(item.name);
    },
    async showPreview(item) {
      // var result = await Files.getStsToken(this.driveId, item.dir_path + item.name, {token_type:'download'})
      // console.log(result)

      // var result = await Files.del(this.driveId, item.dir_path + item.name)
      // console.log(result)

      //item.selected = !item.selected;

      //console.log(item.convertOfficeLoc)
      let splitArr = item.name.split(".");
      let fileType = splitArr[splitArr.length - 1];
      fileType = fileType.toLowerCase();

      let codeMode = CodeMirror.findModeByExtension(fileType);
      if (item.status == "normal") {
        if (Files.isImage(item.name)) {
          this.showPicturePreview(item);
        } else if (fileType == "mp4" || fileType == "flv") {
          this.showVideoPreview(item, fileType);
        } else if (codeMode) {
          this.showCodePreview(item, codeMode);
        } else if (docTypeMap.isMatchTypeByExtension(fileType)) {
          this.showDocPreview(item, fileType);
        } else if (Howler.codecs(fileType)) {
          this.showAudioPreview(item, fileType);
        } else {
          // other
          this.showOtherPreview(item, fileType);
        }
      } else {
        item.selected = !item.selected;
      }
    },
    showPicturePreview(item) {
      //图片预览
      this.$root.$emit("show::PreviewImageDialog", {
        type: this.type,
        driveId: this.driveId,
        item: item
      });
    },
    showVideoPreview(item, fileType) {
      if (fileType == "mp4") {
        //this.analyseVideo(item, fileType);
        this.$root.$emit("show::PreviewVideoAnalyseDialog", {
          item: item
        });
      } else if (fileType == "flv") {
        this.$root.$emit("show::PreviewFlvDialog", {
          item: item
        });
      }
    },
    showCodePreview(item, codeMode) {
      this.$root.$emit("show::PreviewCodeDialog", {
        item: item,
        mode: codeMode,
        isReadonly: this.isReadonly
      });
    },
    showDocPreview(item, fileType) {
      this.$root.$emit("show::PreviewDocDialog", {
        item: item,
        fileType: fileType
      });
    },
    showAudioPreview(item, fileType) {
      this.$root.$emit("show::PreviewAudioDialog", {
        item: item,
        fileType: fileType
      });
    },
    showOtherPreview(item, fileType) {
      this.$root.$emit("show::PreviewOtherDialog", {
        item: item,
        fileType: fileType
      });
    }
  }
};
</script>

<style>
.upload-btn {
  width: 36px;
  height: 36px;
  margin: 8px;
  line-height: 36px;
  text-align: center;
  border-radius: 50%;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.file-input {
  cursor: pointer;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  opacity: 0.01;
  cursor: pointer;
  z-index: 1;
}

.file-item {
  position: relative;
  padding: 2px;
  height: 50px;
  width: 100%;
  cursor: pointer;
  border-radius: 3px;
  border: 0px solid #ccc;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
}

.file-item-checkbox {
  position: absolute;
  top: 0;
  right: 0;
  height: 20px;
  width: 20px;
  padding-top: 0;
}

.address-bar .input-group.input-group--solo {
  min-height: 24px;
}

.address-bar .input-group__input {
  min-height: 24px;
}

.address-bar .input-group.input-group--solo .input-group__input {
  padding: 1px 6px;
}

/*  */
.responsive-speed-dial.v-speed-dial--bottom,
.responsive-speed-dial.v-speed-dial--bottom:not(.v-speed-dial--absolute) {
  bottom: 10px;
  right: 3px;
}
@media (max-width: 1024px) {
  .responsive-speed-dial.v-speed-dial--bottom,
  .responsive-speed-dial.v-speed-dial--bottom:not(.v-speed-dial--absolute) {
    bottom: 60px;
  }
}
</style>

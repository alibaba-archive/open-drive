<template>
<v-dialog v-model="dialog" :persistent="step==2" width="600">

  <v-card>
    <v-card-title class="headline green--text">
      <v-icon class="green--text">content_paste</v-icon>&nbsp;
      {{isMove?'移动':'复制'}}文件
    </v-card-title>
    <v-card-text>

     <section v-if="step==1">
       确定要{{isMove?'移动':'复制'}}以下文件(共{{keepSel.length}}个)到{{currentPath}}:
       <div v-for="(item,$index) in keepSel" :key="$index" v-if="$index<3" class="truncate"><code>{{item.name}}</code></div>
       <div v-if="keepSel.length>3">...</div>
     </section>

     <section v-if="step==2">
       <div v-if="terr.length==0">正在{{isMove?'移动':'复制'}}...<span v-if="progressTotal">({{ progressCurrent }}/{{ progressTotal }})</span></div>
       <v-progress-linear :value="progress*100" height="10"
         info></v-progress-linear>

       <div v-if="terr.length>0">
          以下文件{{isMove?'移动':'复制'}}失败:
          <div v-for="(te,$index) in terr" :key="$index" v-if="$index<3" class="truncate">
            <v-tooltip right :close-delay="400">
              <div v-html="te.error.message"></div>
              <v-icon slot="activator" class="red--text">info</v-icon>
            </v-tooltip>
            {{te.name}}
          </div>

          <div v-if="terr.length>3">...</div>
       </div>

     </section>

    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn class="grey--text darken-1" flat="flat" @click.native="dialog = false">关闭</v-btn>
      <v-btn v-if="step==2 && !stopped" class="grey--text darken-1" flat="flat" @click.prevent.stop="stop()">取消</v-btn>
      <v-btn v-if="step==1" color="success" @click.prevent.stop="start()">确定</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>
<script>
import Files from '@/services/files.js'

export default {
  data() {
    return {
      type: '',
      dialog: false,
      fromPath: '',
      currentPath: '/',
      keepSel: [],
      isMove: false,
      driveId: '',
      step: 1,
      stopped: false,
      progress: 0, //0->1
      progressCurrent: 0,
      progressTotal: 0,
      terr : [] //删除失败列表
    }
  },
  mounted() {

    this.$root.$on('show::PasteFilesDialog', (opt) => {
      this.type=opt.type;
      this.driveId = opt.driveId;
      this.fromPath = opt.fromPath;
      this.currentPath = opt.currentPath;
      this.keepSel = opt.keepSel;
      this.isMove = opt.isMove;
      this.dialog = true;
      //init
      this.step=1;
      this.stopped = false;
      this.progress=0;
    });
  },
  destroyed(){
    this.$root.$off('show::PasteFilesDialog')
  },
  methods: {
    start() {
      this.step= 2;
      this.stopped = false;

      Files.copyFiles(this.type, this.driveId, {
        isMove: this.isMove,
        to: this.currentPath,
        from: this.fromPath,
        items: JSON.parse(JSON.stringify(this.keepSel)),
        progress: (p, current, total)=>{
          this.progress = p;
          this.progressCurrent = current;
          this.progressTotal = total;
        }
      }).then((terr) => {
        this.$root.$emit('refresh::fileList', {
          path: this.currentPath
        });

        if(terr==0){
          this.dialog = false;
        }
        else{
          this.stopped = true;
          this.terr = terr;
        }

        if(!this.isMove)this.$root.$emit('driveSizeChanged')

      }, (err) => {

      });
    },
    stop(){
      this.stopped = true;
      Files.stopCopyFiles();
    }
  }
}
</script>

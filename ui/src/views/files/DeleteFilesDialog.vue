<template>
<v-dialog v-model="dialog" :persistent="step==2" width="600">

  <v-card>
    <v-card-title class="headline red--text">
      <v-icon class="red--text">fa-trash-o</v-icon>&nbsp; 删除文件
    </v-card-title>
    <v-card-text>

     <section v-if="step==1">
       确定要删除这些文件(共{{hasSel.length}}个):
       <div v-for="(item,$index) in hasSel" :key="$index" v-if="$index<3" class="truncate"><code>{{item.name}}</code></div>
       <div v-if="hasSel.length>3">...</div>
     </section>

     <section v-if="step==2">
       <div v-if="terr.length==0">正在删除...<span v-if="progressTotal">({{ progressCurrent }}/{{ progressTotal }})</span></div>
       <v-progress-linear v-model="progress" height="10"
         info></v-progress-linear>

       <div v-if="terr.length>0">
          以下文件删除失败:
          <div v-for="(te,$index) in terr" :key="$index" v-if="$index<3" class="truncate">
            <v-tooltip right attach>
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
      <v-btn v-if="step==2 && !stopped" class="grey--text darken-1" flat="flat" @click.prevent.stop="stopDeleting()">取消</v-btn>
      <v-btn v-if="step==1" color="success" @click.prevent.stop="startDeleting()">确定</v-btn>
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
      driveId: '',
      currentPath: '/',
      hasSel: [],
      step: 1,
      stopped: false,
      progress: 0, //0->100
      progressCurrent: 0,
      progressTotal: 0,
      progress2: 0,
      terr : [] //删除失败列表
    }
  },
  mounted() {
    this.$root.$on('show::DeleteFilesDialog', (opt) => {

      this.type = opt.type,
      this.driveId = opt.driveId;
      this.currentPath = opt.currentPath;
      this.hasSel = opt.hasSel;
      this.dialog = true;
      //init
      this.step=1;
      this.terr=[];
      this.stopped = false;
      this.progress=0;
    });
  },
  destroyed(){
    this.$root.$off('show::DeleteFilesDialog')
  },
  methods: {
    async startDeleting() {
      var that = this;
      this.step= 2;
      this.stopped = false;
      this.progress = 0;

      var terr = await Files.deleteFiles(this.type, this.driveId, {
        items: JSON.parse(JSON.stringify(this.hasSel)),
        progress: (p, current, total)=>{
          that.progress = p*100;
          this.progressCurrent = current;
          this.progressTotal = total;
          this.$root.$emit('driveSizeChanged')
        }
      });

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


    },
    stopDeleting(){
      this.stopped = true;
      Files.stopDeletingFiles();
    }
  }
}
</script>

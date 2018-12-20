<template>
<v-dialog v-model="dialog" :persistent="step==2" width="600">
<v-form v-model="valid" ref="form" lazy-validation @submit.prevent="start">
  <v-card>
    <v-card-title class="headline green--text">
      <v-icon class="green--text">create</v-icon>&nbsp;
      重新命名
    </v-card-title>
    <v-card-text>

     <section v-if="step==1">
       <v-container grid-list-md>

           <v-text-field
               v-model.trim="newName"
               :rules="newNameRule" required>
           </v-text-field>

       </v-container>
     </section>

     <section v-if="step==2">
       <div v-if="terr.length==0">正在重新命名...<span v-if="progressTotal">({{ progressCurrent }}/{{ progressTotal }})</span></div>
       <v-progress-linear :value="progress*100" height="10"
         info></v-progress-linear>

       <!-- <div v-if="terr.length>0">
          以下文件{{isMove?'移动':'复制'}}失败:
          <div v-for="te,$index in terr" v-if="$index<3" class="truncate">
            <v-tooltip right :close-delay="400">
              <div v-html="te.error.message"></div>
              <v-icon slot="activator" class="red--text">info</v-icon>
            </v-tooltip>
            {{te.name}}
          </div>

          <div v-if="terr.length>3">...</div>
       </div> -->

     </section>

    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn class="grey--text darken-1" flat="flat" @click.native="dialog = false">关闭</v-btn>
      <v-btn v-if="step==2 && !stopped" class="grey--text darken-1" flat="flat" @click.prevent.stop="stop()">取消</v-btn>
      <!-- <v-btn v-if="step==1" color="success" @click.prevent.stop="start()">确定</v-btn> -->
      <v-btn type="submit" :disabled="!valid" color="success">确定</v-btn>
    </v-card-actions>
  </v-card>
  </v-form>
</v-dialog>
</template>
<script>
import Files from '@/services/files.js'

export default {
  data() {
    return {
      valid: false,
      type: '',
      dialog: false,
      fromPath: '',
      currentPath: '/',
      newName: "",
      newNameRule: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 100) || 'It must be less than 100 characters'
      ],
      hasSel: [],
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
    this.$root.$on('show::RenameDialog', (opt) => {
      this.type=opt.type;
      this.driveId = opt.driveId;
      this.fromPath = opt.fromPath;
      this.currentPath = opt.currentPath;
      this.hasSel = opt.hasSel;
      this.isMove = opt.isMove;
      this.dialog = true;
      this.newName = this.hasSel[0].name;
      //init
      this.step=1;
      this.stopped = false;
      this.progress=0;
    });
  },
  destroyed(){
    this.$root.$off('show::RenameDialog')
  },
  methods: {
    start() {
      if (!this.$refs.form.validate()) return;
      if(this.newName == this.hasSel[0].name){
        this.dialog = false;
        return ;
      }
      this.step= 2;
      this.stopped = false;
      Files.copyFiles(this.type, this.driveId, {
        isMove: this.isMove,
        to: this.currentPath,
        from: this.fromPath,
        newName: this.newName,
        items: JSON.parse(JSON.stringify(this.hasSel)),
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

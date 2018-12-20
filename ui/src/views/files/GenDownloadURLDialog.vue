<template>
<v-dialog v-model="dialog" max-width="500">
  <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
    <v-card>
      <v-card-title>
        <div class="headline"><v-icon class="success--text">link</v-icon>生成下载链接</div>
      </v-card-title>

      <v-card-text>

        <v-radio-group label="有效时长" v-model="expires_type" column @change="expiresTypeChange">
          <v-radio label="1天" :value="1"></v-radio>
          <v-radio label="2天" :value="2"></v-radio>
          <v-radio label="3天" :value="3"></v-radio>
          <v-radio label="4天" :value="4"></v-radio>
          <v-radio label="自定义" :value="5"></v-radio>
        </v-radio-group>

        <v-text-field v-if="expires_type == 5" :rules="[v=>!!v||'Required',v=>/^[0-9]*[1-9][0-9]*$/.test(v)||'It must be an Integer']" label="指定有效时长(单位:秒)" v-model.trim="expires_sec" type="number" min="1" required></v-text-field>

        <LoadingBar v-if="loading"></LoadingBar>

        <v-text-field id="urlElm" v-if="!loading && download_url" label="生成的URL" readonly v-model.trim="download_url"></v-text-field>
      </v-card-text>

      <v-card-actions style="border-bottom:1px solid #ccc">
        <v-spacer></v-spacer>
        <v-btn v-if="download_url" @click="copy()" class="info--text darken-1" flat="flat">复制链接</v-btn>
        <v-btn class="green--text darken-1" flat="flat" @click.native="dialog=false">取消</v-btn>
        <v-btn type="submit" color="success">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</v-dialog>
</template>

<script>
import Files from '@/services/files.js'
import F from '@/services/f.js'

export default {
  data() {
    return {
      valid: false,

      expires_type: 1,

      dialog: false,
      loading: false,

      type: '',
      driveId: '',
      filePath: '',

      expires_sec: 3600,

      download_url: '',

    }
  },
  watch: {
    dialog(v){
      if(!v) this.init();
    }
  },
  mounted() {
    this.$root.$on('show::GenDownloadURLDialog', ({
      type,
      driveId,
      filePath
    }) => {
      this.type = type;
      this.driveId = driveId;
      this.filePath= filePath;
      this.dialog = true;

      this.expiresTypeChange()
    })
  },
  destroyed(){
    this.$root.$off('show::GenDownloadURLDialog')
    this.init();
  },
  methods: {
    init(){
      // this.$root.$off('show::GenDownloadURLDialog')
      this.type = '';
      this.driveId = '';
      this.filePath= '';
      this.download_url='';
      this.expires_type= 1;
      this.expiresTypeChange();
    },
    expiresTypeChange(){
      this.expires_sec = this.expires_type*24*3600
    },
    copy(){
      document.getElementById("urlElm").select();
      document.execCommand("copy");
      Toast.success('复制成功');
    },
    async submit() {
      var result;
      if (!this.$refs.form.validate()) return;

      this.loading=true;

      result = await Files.genSignedUrl(this.type, this.driveId, this.filePath, {
        type: 'download',
        expires_sec: this.expires_sec
      });
      this.download_url = result.url;
      this.loading=false;
    }
  }
}
</script>

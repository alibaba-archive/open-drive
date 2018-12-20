<template>
<v-dialog v-model="dialog" max-width="500">
  <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
    <v-card>
      <v-card-title>

        <div class="headline">
          <DriveIcon/>
          创建{{item.source_path=='/'?'根':''}}云盘</div>
      </v-card-title>


      <v-card-text>

        <v-text-field label="云盘名称" v-model.trim="item.drive_name" :rules="nameRules" :counter="255" required></v-text-field>

        <UserSelector label="授权给" required v-model.trim="grant_tos" :rules="[v=>!!v||'Required']" :init="initUserSelector"></UserSelector>
        <!-- <v-text-field label="授权给" v-model="item.grant_to" required></v-text-field> -->

       <v-switch label="设置云盘大小（不设置则不限大小）" hide-details v-model="size_on" @change="!size_on?item.total_size=0:null"></v-switch>
       <v-text-field v-if="size_on" required label="云盘大小(单位:MB)" v-model="item.total_size" :min="1" type="number"
       :rules="[v=>!!v||'Required',v=>/^[0-9]*[1-9][0-9]*$/.test(v)||'It must be an Integer']"></v-text-field>
       <v-divider></v-divider>


        <v-textarea rows="2" placeholder="备注（255字）" :rules="descRules" :counter="255" label="备注:"  v-model.trim="item.description"></v-textarea>

      </v-card-text>

      <v-card-actions style="border-bottom:1px solid #ccc">
        <v-spacer></v-spacer>
        <v-btn class="green--text darken-1" flat="flat" @click.native="dialog=false">取消</v-btn>
        <v-btn type="submit" :disabled="!valid" color="success">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</v-dialog>
</template>

<script>
import Drives from '@/services/drives.js'
import F from '@/services/f.js'
import UserSelector from '@/views/_/UserSelector.vue'

export default {
  components: {
    UserSelector
  },
  data() {
    return {
      valid: false,
      initUserSelector: false,

      size_on: false,

      endpoint: Global.endpoint,
      dialog: false,
      hideSourceItems: false,
      grant_tos: [],
      item: {
        description: '',
        drive_name: '',
        grant_to: '',
        storage_id: '',
        total_size: 1
      },

      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 255) || 'It must be less than 255 characters'
      ],
      descRules: [
        v =>  !v || v.length <= 255 || 'It must be less then 255 characters'
      ]
    }
  },
  async mounted() {
    this.$root.$on('show::CreateDriveDialog', ({
      hideSourceItems,
      item,
      callback
    }) => {
      Object.assign(this.item, item)
      if(this.grant_tos.length > 0){
        this.grant_tos = [];
      }
      this.size_on = false;
      this.item.total_size = 1;
      this.callback = callback;
      this.dialog = true;
      this.hideSourceItems = hideSourceItems
      this.initUserSelector= true;
    })
  },
  destroyed(){
    this.$root.$off('show::CreateDriveDialog')
  },
  methods: {
    async submit() {
      if (!this.$refs.form.validate()) return;

      Toast.info('正在创建...');
      var item = clone(this.item);

      if(this.size_on) item.total_size = parseInt(item.total_size) * 1024 * 1024;
      else item.total_size = 0;



      for(var k of this.grant_tos){
        item.grant_to = k;
        try{
          await Drives.add(item);
          Toast.success('创建成功');
          this.callback(item);
        }catch(e){

        }
      }
      this.dialog = false;
      return false;
    }
  }
}
</script>

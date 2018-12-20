<template>
<v-dialog v-model="dialog" max-width="500">
  <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
    <v-card>
      <v-card-title>
        <div class="headline"><v-icon class="success--text">create_new_folder</v-icon>新建目录</div>
      </v-card-title>

      <v-card-text>
        <v-text-field label="目录名称" v-model.trim="item.name" :rules="nameRules" :counter="255" required></v-text-field>

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
import Files from '@/services/files.js'
import F from '@/services/f.js'

export default {
  data() {
    return {
      valid: false,

      endpoint: Global.endpoint,
      dialog: false,

      type: '',

      driveId: '',
      item: {
        name: '',
        dir_path: ''
      },

      nameRules: [
        v => !!v || 'Name is required',
        v => (v && v.length <= 255) || 'It must be less than 255 characters'
      ],

    }
  },
  mounted() {
    this.$root.$on('show::AddFolderDialog', ({
      driveId,
      type,
      item,
      callback
    }) => {
      this.driveId = driveId;
      this.type = type;
      Object.assign(this.item, item)

      this.callback = callback;
      this.dialog = true;
    })
  },
  destroyed(){
    this.$root.$off('show::AddFolderDialog')
  },
  methods: {
    async submit() {
      if (!this.$refs.form.validate()) return;

      Toast.info('正在添加...');
      var item = clone(this.item)

      await Files.create(this.type, this.driveId, item);
      Toast.success('添加成功');
      this.callback(item);

      this.dialog = false;
    }
  }
}
</script>

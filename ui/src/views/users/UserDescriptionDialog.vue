<template>
  <v-dialog v-model="dialog" max-width="400" >
    <v-card>
      <v-card-title>
        <div v-if="item" class="headline">修改{{item.nick_name}}的备注:</div>
      </v-card-title>
      <v-card-text>
         <v-textarea v-if="item" placeholder="备注（100字）" :rules="[
              () => !item.description || item.description.length <= 100 || '不能超过100个字符',
            ]"
            counter="100" label="Description" v-model="item.description"></v-textarea>
      </v-card-text>
      <v-card-actions style="border-bottom:1px solid #ccc">
        <v-spacer></v-spacer>
        <v-btn class="green--text darken-1" flat="flat" @click.native="dialog=false">取消</v-btn>
        <v-btn class="green--text darken-1" flat="flat" @click.stop="ok">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Users from '@/services/users.js'

export default{
  data(){
    return {
      dialog: false,
      item: null
    }
  },
  mounted(){
    this.$root.$on('show::UserDescriptionDialog', ({item, callback})=>{ 
      this.item = clone(item)
      this.callback = callback;
      this.dialog=true;
    })
  },
  methods: {
    async ok(){
      Toast.info('正在修改...');
      await Users.update(this.item.user_id, {
        description: this.item.description
      });
      Toast.success('修改成功');
      this.callback(this.item);
      this.dialog  = false;
    }
  }
}
</script>

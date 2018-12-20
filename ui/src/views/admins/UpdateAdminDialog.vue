<template>
<v-dialog v-model="dialog" max-width="500">
  <v-card>
    <v-card-title>
      <div v-if="isUpdate" class="headline">修改管理员信息</div>
      <div v-else class="headline">设为管理员</div>
    </v-card-title>


    <v-card-text>
      <v-list>
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <img v-if="item.avatar_url" :src="endpoint+item.avatar_url" />
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title v-html="item.nick_name"></v-list-tile-title>
            <v-list-tile-sub-title>ID: {{item.user_id}}</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>



      </v-list>

      <v-radio-group label="权限:" v-model="item.privilege" :mandatory="false">
        <v-radio label="只读(ReadOnly)" value="readonly"></v-radio>
        <v-radio label="可写(Writable)" value="writable"></v-radio>
        <v-radio label="可授权(Grantable)" value="grantable"></v-radio>
      </v-radio-group>

      <v-textarea rows="2" v-if="item" placeholder="备注（100字）" :rules="[
              () => !item.description || item.description.length <= 100 || '不能超过100个字符',
            ]" counter="100" label="备注:" v-model="item.description"></v-textarea>
    </v-card-text>
    <v-card-actions style="border-bottom:1px solid #ccc">
      <v-spacer></v-spacer>
      <v-btn class="green--text darken-1" flat="flat" @click.native="dialog=false">取消</v-btn>
      <v-btn color="success" @click.stop="ok">确定</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script>
import Admins from '@/services/admins.js'

export default {
  data() {
    return {
      endpoint: Global.endpoint,
      isUpdate: true,
      dialog: false,
      item: {
        user_id: '',
        privilege: 'readonly',
        description: ''
      }
    }
  },
  mounted() {
    this.$root.$on('show::UpdateAdminDialog', ({
      item,
      isUpdate = true,
      callback
    }) => {
      Object.assign(this.item, item)
      this.isUpdate = isUpdate;

      this.callback = callback;
      this.dialog = true;
    })
  },
  methods: {
    async ok() {
      Toast.info('正在修改...');
      await Admins.update(this.item.user_id, {
        privilege: this.item.privilege,
        description: this.item.description
      });
      Toast.success('修改成功');
      this.callback(this.item);
      this.dialog = false;
    }
  }
}
</script>

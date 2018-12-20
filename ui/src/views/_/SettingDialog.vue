<template>
  <v-layout row justify-center>

    <v-dialog v-model="dialog"  max-width="500px">
      <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
      <v-card>
        <v-toolbar flat>
          <v-card-title>
            <span class="headline">设置</span>
          </v-card-title>
          <v-progress-circular indeterminate :size="30" color="grey darken-3" v-if="loading"></v-progress-circular>
        </v-toolbar>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field
                    type="number"
                    label="并发上传文件数"
                    v-model="item.maxUploadJobCount"
                    :rules="rules.maxUploadJobCount"
                    hint="当上传文件数量较多时，允许同时上传的最大文件数。">
                </v-text-field>
              </v-flex>


              <v-flex xs12 v-if="isElectron">
                <v-text-field
                    type="number"
                    label="并发下载文件数"
                    v-model="item.maxDownloadJobCount"
                    :rules="rules.maxDownloadJobCount"
                    hint="当下载文件数量较多时，允许同时下载的最大文件数。">
                </v-text-field>
              </v-flex>


            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" flat @click="close()">取消</v-btn>
          <v-btn color="success" type="submit" :disabled="!valid || loading">保存</v-btn>
        </v-card-actions>
      </v-card>
       </v-form>
    </v-dialog>

  </v-layout>
</template>

<script>
import SettingsSvs from '@/services/settingsSvs'

export default {
  data: () => ({
    valid: false,
    dialog: false,
    loading: false,
    isElectron: window.isElectron,
    item: {
      maxDownloadJobCount: 3,
      maxUploadJobCount: 3,
    },
    rules: {
      maxUploadJobCount: [(val) => {
        if(/\D/.test(''+val) || val < 1 || val > 5) return "该值必须是1~5的整数"
        return true;
      }],
      maxDownloadJobCount: [(val) => {
        if(/\D/.test(''+val) || val < 1 || val > 5) return "该值必须是1~5的整数"
        return true;
      }]
    }
  }),
  mounted(){
    this.$root.$on('show::setting', () => {
      this.dialog = true;
      this.item.maxDownloadJobCount = SettingsSvs.maxDownloadJobCount.get()
      this.item.maxUploadJobCount = SettingsSvs.maxUploadJobCount.get()
    });
  },
  destroyed(){
    this.$root.$off('show::setting');
  },
  methods: {
    close() {
      this.dialog = false;
    },
    submit(){
      if (!this.$refs.form.validate()) return;
      // 校验所有配置是否合法
      SettingsSvs.maxUploadJobCount.set(this.item.maxUploadJobCount)
      SettingsSvs.maxDownloadJobCount.set(this.item.maxDownloadJobCount)

      this.dialog = false;
    }
  },
}
</script>

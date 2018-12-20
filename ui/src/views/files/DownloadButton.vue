<template>
  <v-menu bottom left open-on-hover offset-y>
    <v-btn slot="activator" icon><v-icon>file_download</v-icon></v-btn>
    <v-list>
      <v-list-tile v-if="isElectron" @click="electronDownload">
        <v-list-tile-title>直接下载(有效期1小时)</v-list-tile-title>
      </v-list-tile>
      <v-list-tile v-else :href="item.download_url" target="_blank">
        <v-list-tile-title>直接下载(有效期1小时)</v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click.stop="genDownloadUrl">
        <v-list-tile-title>生成下载链接</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>

</template>

<script>

export default{
  props: ['item','driveId','type'],
  data(){
    return {
      isElectron: window.isElectron
    }
  },

  methods: {
    electronDownload(){
      this.$root.$emit('showElectronDownloadDialog',{
        items: [this.item]
      });
      //this.$emit('done')
    },
    genDownloadUrl(){
       this.$root.$emit('show::GenDownloadURLDialog', {
         type: this.type,
         driveId: this.driveId,
         filePath: this.item.path,
       })
    }
  }
}
</script>

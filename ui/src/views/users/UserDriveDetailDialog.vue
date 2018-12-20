<template>
<v-dialog v-model="dialog" max-width="500">
  <v-card>
    <v-card-title>
      <div v-if="item" class="headline">详情</div>
    </v-card-title>
    <v-divider></v-divider>

    <v-list v-if="item" dense>
      <v-list-tile v-for="(v,k, $index) in item" :key="$index">
        <v-list-tile-content>{{k}}:</v-list-tile-content>
        <v-list-tile-content class="align-end">{{v}}</v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-divider></v-divider>
    <v-card-actions style="border-bottom:1px solid #ccc">
      <v-spacer></v-spacer>
      <v-btn class="green--text darken-1" flat="flat" @click.native="dialog=false">关闭</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      item: null
    }
  },
  mounted() {
    this.$root.$on('show::UserDriveDetailDialog', ({
      item
    }) => {
      this.item = clone(item)
      this.dialog = true;
    })
  }
}
</script>

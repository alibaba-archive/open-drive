<template>
<div grid-list-md style="position:fixed;z-index:9999;">
  <v-layout row>
    <v-flex md4 sm6 style="position:fixed;z-index:9999;width:100%;left:0px;top:50px;right:0;margin-left: auto; margin-right: auto;">
      <v-alert v-for="item in items" :key="item.id" v-model="item.id"
      :color="item.type"

       transition="slide-y-reverse-transition"
        dismissible>
        {{item.message}}
      </v-alert>

      <v-spacer></v-spacer>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
export default {
  data() {
    return {
      items: []
    }
  },
  mounted() {
    this.$root.$on('toast', (opt) => {
      //opt = { message, type(info,primary,secondary,warning,error), ttl(ms) }
      opt.id = Math.random();

      this.items.push(opt);
      setTimeout(() => {
        for (var i = 0; i < this.items.length; i++) {
          if (this.items[i].id == opt.id) {
            this.items.splice(i, 1);
            break;
          }
        }
      }, opt.ttl || 2000);
    });

  }
}
</script>

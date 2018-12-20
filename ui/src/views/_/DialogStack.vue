<template>
  <div class="dialog-stack">
  <v-dialog v-model="item.id" :key="item.id" :persistent="item.persistent" :max-width="item.width||400" lazy absolute v-for="item in items" content-class="dialog-z">
    <v-card>
      <v-card-title>
        <div class="headline" v-html="item.title"></div>
      </v-card-title>
      <v-card-text>
         <div :class="item.cls" v-html="item.message"></div>
      </v-card-text>
      <v-card-actions style="border-bottom:1px solid #ccc">
        <v-spacer></v-spacer>
        <v-btn v-if="item.type=='confirm'" class="green--text darken-1" flat  @click.stop="close(item)">取消</v-btn>
        <v-btn :color="btnColor(item)" @click.stop="ok(item)">确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</div>
</template>

<script>
export default {
  data(){
    return {
      items: []
    }
  },
  watch: {
    items:{
      deep:true,
      handler: function(){
        for(var i=0;i<this.items.length;i++){
          if(false==this.items[i].id){
            this.items.splice(i,1);
            i--;
          }
        }
      }
    }
  },
  mounted(){
    this.$root.$on('add::Dialog', (item)=>{
      item.id='id-'+Date.now();
      this.items.unshift(item)
    });
  },
  methods: {
    close(item){
      item.callback?item.callback(false):null;
      item.id=false;
      // this.removeItem(item.id)
    },
    ok(item){
      item.callback?item.callback(true):null;
      item.id=false;
      // this.removeItem(item.id)
    },
    btnColor(item) {
      return item.type === 'warn' ? 'error' : 'success';
    }
    // removeItem(id){
    //   for(var i=0;i<this.items.length;i++){
    //     if(id==this.items[i].id){
    //       this.items.splice(i,1);
    //       break;
    //     }
    //   }
    // }
  }
}
</script>

<style>
.dialog-z{
  z-index: 6;
}
</style>

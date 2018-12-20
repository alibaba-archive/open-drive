<template>
  <v-autocomplete
         :label="label"
         :items="users"
         v-model="currentValue"
         :search-input.sync="search"
         item-text="nick_name"
         item-value="user_id"
         multiple
         chips
         cache-items
         hint="将为选择的每个人创建一个云盘"
         :persistent-hint="currentValue && currentValue.length > 1"
         required
         :rules="[() => currentValue && currentValue.length > 0 || 'You must choose at least one']"
         :loading="loading"
         
         :menu-props="{maxHeight:'300'}"
         >
         <template slot="selection" slot-scope="data">
           <v-chip
             close
             @input="data.parent.selectItem(data.item)"
             :selected="data.selected"
             class="chip--select-multi"
             :key="JSON.stringify(data.item)"
           >
             <v-avatar>
               <img :src="data.item.avatar_url">
             </v-avatar>
             {{ data.item.nick_name }}
           </v-chip>
         </template>
         <template slot="item" slot-scope="data">
           <template v-if="typeof data.item !== 'object'">
             <v-list-tile-content v-text="data.item"></v-list-tile-content>
           </template>
           <template v-else>
             <v-list-tile-avatar>
               <img :src="data.item.avatar_url">
             </v-list-tile-avatar>
             <v-list-tile-content>
               <v-list-tile-title v-html="data.item.nick_name"></v-list-tile-title>
               <v-list-tile-sub-title v-html="data.item.user_id"></v-list-tile-sub-title>
             </v-list-tile-content>
           </template>
         </template>
      </v-autocomplete>
</template>
<script>
import Users from '@/services/users.js'

var tid;
export default {
  props: ['label','value','init'],
  data(){
    return {
      search: null,
      loading:false,
      endpoint: Global.endpoint,
      users: []
    }
  },
  watch: {
    search (val) {
      val && this.querySelections(val)
    },
    init(v){
      if(v)this.querySelections('')
    }
  },
  computed: {
    currentValue: {
      get(){
        return this.value;
      },
      set(val){
        this.$emit('input',val)
      }
    }
  },
  async mounted(){
    this.currentValue= this.value;
    this.users = [];

  },
  methods: {
    async querySelections (v) {
      this.loading = true;
      clearTimeout(tid)
      tid = setTimeout(async ()=>{
        var result = await Users.list({nick_name: v, ignoreError:true})
        var arr = result.items || [];
        arr.forEach(n=>{
          n.avatar_url = Global.endpoint + n.avatar_url;
        })
        // arr.unshift({
        //   nick_name: '所有人',
        //   user_id: '*',
        //   avatar_url: Const.default_avatar
        // })
        this.users = arr;
        this.loading = false
      },1000);
    }
  }
}
</script>

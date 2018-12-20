<template>
  <div class="text-xs-center pt-4">
    <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
  </div>
</template>

<script>
import Shares from '@/services/shares.js'
export default {
  data(){
    return {}
  },
  async mounted(){
    var key = this.$route.params.sharekey;
    var result = await Shares.create_share_by_keys({
      key: key
    });
    if(result && result.share_id){
      this.$router.push({path: "/shares/" + result.share_id});
      return ;
    }
    if(result === false){
      return ;
    }
    this.$router.push({path: "/shares"});
  }
}
</script>

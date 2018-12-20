<template>
  <div class="text-xs-center pt-4">
    <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
  </div>
</template>

<script>
import TokenStore from '@/services/TokenStore.js'
export default {
  data(){
    return {}
  },
  async mounted(){
    var access_token = this.$route.params.access_token;
    var share_id = this.$route.params.share_id;

    var tokenInfo = await TokenStore.get();
    if(!tokenInfo.access_token){
      TokenStore.save({
        access_token: access_token
      });
    }
    if(share_id){
      this.$router.push("/shares/" + share_id);
      return ;
    }
  }
}
</script>

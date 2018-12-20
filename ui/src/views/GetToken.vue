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
  mounted(){
    var code = this.$route.query.code;
    //console.log(code)
    var that = this;

    if(code){
      var headers = {};
    
      $.ajax({
        method: "GET",
        url: Global.endpoint+'/token',
        data: {grant_type: "authorization_code", code:code, client_id: Global.client_id},
        headers:headers
      }).then(data => {
        TokenStore.save(data)

        this.getLoginRedirect();
      }).catch(function(xhr){
        alert(xhr.responseJSON.message)
        that.$router.push({name:'SignIn'})
      });
    }else{
      window.location.href="/404.html"
      //that.$router.push({name:'Main'})
    }
  },
  methods: {
    getLoginRedirect(){

      var url = localStorage.getItem("login_redirect");
 
      if(url){
        localStorage.removeItem("login_redirect");
        if(top!=window){
          //top.window.MyApp.$router.push(url);
          top.location.href=url;
        }
        else this.$router.push(url);
      }
      else{
        if(top!=window){
          //top.window.MyApp.$router.push({name:'Main'});
          top.location.href='/'
        }
        else this.$router.push({name:'Main'})
      }
    }
  }
}
</script>

<template>
  <v-container fluid grid-list-xs class="pa-0">

    <v-layout row wrap class="grey lighten-4 py-5 bg3" >

      <v-flex sm8 md5 offset-md7 offset-sm2 >

         <!-- <v-card style="max-width:400px;margin:auto"  v-if="(userInfo && userInfo.user_name)">
           已经登录
         </v-card> -->
        <v-card style="max-width:400px;margin:auto">
         <div v-show="ding_api_id">
          <v-tabs v-model="tabs" fixed-tabs>
            <v-tab href="#qr">
              钉钉扫码登录
            </v-tab>
            <v-tab href="#acc">
              钉钉账号登录
              <!-- <v-btn small flat @click="initFormLogin"><v-icon>fa-refresh</v-icon></v-btn> -->
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="tabs" class="white elevation-1">
            <v-tab-item value="qr">
              <div style="text-align:center;width:100%">
                <div id="login_container2"></div>
              </div>
            </v-tab-item>
            <v-tab-item value="acc">
              <div id="login_container"></div>
            </v-tab-item>
          </v-tabs-items>
         </div>
         
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TokenStore from "@/services/TokenStore.js";
import $ from "jquery";
import crypto from "crypto-browserify";


function createIframe(id, url, width='100%', height='400px') {
  var e, c = document.createElement("iframe");

  c.src = url,
  c.frameBorder = "0",
  c.allowTransparency = "true",
  // c.scrolling = "no",

  c.width =  width
  c.height =  height

  e = document.getElementById(id),
  e.innerHTML = "",
  e.appendChild(c)
}


export default {
  data() {
    return {
      tabs: null,
      ding_api_id: null,
      redirect_url: "",
      clicked: false,
      username: "",
      password: ""
    };
  },
  computed: {
    userInfo(){
      return this.$root.userInfo;
    }
  },

  async mounted() {
    var tokenInfo = await TokenStore.get();
    
    if(!tokenInfo.access_token){
      this.$root.userInfo = {};
    }
    
    if(this.$root.userInfo && this.$root.userInfo.user_name){
      this.successForward()
    }

    this.$root.$on('load::UserInfo', (data) => {
      if(this.$root.userInfo && this.$root.userInfo.user_name){
        this.successForward()
      }
    });
 
    this.redirect_url = location.protocol + "//" + location.host + "/#/token";
    
    this.ding_api_id = this.$route.params.appId;
    if(this.ding_api_id){ 
      ///////////////////
      this.initQrCode();
      this.initFormLogin();
    }else{
      this.$router.push('/SignIn')
    }
  },

  methods: {
    successForward(){
      var url = localStorage.getItem("login_redirect");
      if(url){
        localStorage.removeItem("login_redirect");
        this.$router.push(url);
      }
      else{
        this.$router.push({name:'Main'})
      }
    },
    initQrCode(){
      var DING_API =  'https://oapi.dingtalk.com';
      var appId = this.ding_api_id;
      var state = 'st-'+((''+Math.random()).substring(2))

      var stateInfo = {
        client_id: Global.client_id,
        state,
        response_type: 'code',
        scope: 'dingding_qrcode',
        redirect_uri: (this.redirect_url)
      };
      //console.log('stateInfo:', stateInfo)

      var infoStr = Buffer.from(JSON.stringify(stateInfo)).toString('base64');
      var redirectUri = encodeURIComponent(Global.endpoint + '/callback?info=' + infoStr);
      console.log('redirectUri:', redirectUri)

      var url = `${DING_API}/connect/oauth2/sns_authorize?appid=${appId}&state=${state}&response_type=code&scope=snsapi_login&redirect_uri=${redirectUri}`;


      //////////////////
      window.hanndleMessage = function (event) {
        var origin = event.origin;
        //console.log("origin", event.origin);
        if( origin == "https://login.dingtalk.com" ) { //判断是否来自ddLogin扫码事件。
            var loginTmpCode = event.data; //拿到loginTmpCode后就可以在这里构造跳转链接进行跳转了
            // console.log("loginTmpCode", loginTmpCode);
            // console.log('goto:',url+'&loginTmpCode='+loginTmpCode)
            window.location.href=url+'&loginTmpCode='+loginTmpCode;
        }
      };

      if (typeof window.addEventListener != 'undefined') {
          window.addEventListener('message', hanndleMessage, false);
      } else if (typeof window.attachEvent != 'undefined') {
          window.attachEvent('onmessage', hanndleMessage);
      }

      var goto = encodeURIComponent(url);

      var obj = DDLogin({
        id: "login_container2",
        goto,
        style: "border:none;background-color:#FFFFFF;",
        width: "365",
        height: "400"
      });
    },
    initFormLogin(){

      var _url =
        Global.endpoint +
        "/authorize?client_id=" +
        Global.client_id +
        "&scope=dingding_login&response_type=code&redirect_uri=" +
        encodeURIComponent(this.redirect_url);


     var DING_API =  'https://oapi.dingtalk.com';
      var appId = this.ding_api_id;
      var state = 'st-'+((''+Math.random()).substring(2))

      var stateInfo = {
        client_id: Global.client_id,
        state,
        response_type: 'code',
        scope: 'dingding_qrcode',
        redirect_uri: (this.redirect_url), 
      };


      var infoStr = Buffer.from(JSON.stringify(stateInfo)).toString('base64');

      var redirectUri = encodeURIComponent(Global.endpoint + '/callback?info=' + infoStr);
      console.log('redirectUri:', redirectUri)
      var url = `${DING_API}/connect/oauth2/sns_authorize?appid=${appId}&state=${state}&response_type=code&scope=snsapi_login&redirect_uri=${redirectUri}`;

      var goto = encodeURIComponent(url);

      createIframe('login_container', 'https://login.dingtalk.com/login/index.htm?goto='+goto,'100%')

    }
  }
};
</script>


<style>
.bg3{
  background: #ccccfd; 
}
</style>

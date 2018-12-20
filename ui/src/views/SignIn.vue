<template>
  <v-container>
    <v-layout>

      <v-flex  sm6 offset-sm3>
         
        <v-card>
          <v-card-title><div class="headline">使用第三方登录</div></v-card-title>
          <v-card-actions v-if="authorize_types" style="flex-direction: row; justify-content: center; padding: 0 0 20px 0;">

            <v-tooltip v-if="authorize_types.dingding" top>钉钉登录
              <v-avatar slot="activator" style="cursor:pointer;margin:10px;" @click.stop="dindingLogin">
                <img src='/static/dingding.png'>
              </v-avatar>
            </v-tooltip>

            <v-tooltip v-if="authorize_types.alipay" top>支付宝登录
              <v-avatar slot="activator" style="cursor:pointer;margin:10px;" @click.stop="aliPayLogin">
                <img src='/static/alipay.png'>
              </v-avatar>
            </v-tooltip>

          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import TokenStore from "@/services/TokenStore.js";
import Quotas from "@/services/quotas.js";
import $ from "jquery";
import crypto from "crypto-browserify";
export default {
  data() {
    return {
      redirect_url: "",
      clicked: false,
      username: "",
      password: "",
      authorize_types: null
    };
  },
  created() {
    this.redirect_url = location.protocol + "//" + location.host + "/#/token";
    this.init()
  },
  methods: {
    async init(){
      var quotas = await Quotas.get();
      this.authorize_types =  quotas.authorize;
    },
    dindingLogin() {
      this.$router.push({name:'DingDingSignIn', params:{appId: this.authorize_types.dingding.app_id}}); 
    },
    aliPayLogin() {
      //this.clicked = true;
      var redirect_url = this.redirect_url;
      window.location.href =
        Global.endpoint +
        "/authorize?client_id=" +
        Global.client_id +
        "&scope=alipay&response_type=code&redirect_uri=" +
        encodeURIComponent(redirect_url);
    },
    getSignature(method, params, secret) {
      params.method = method;
      var paramArr = [];
      // 拼接待签名内容
      Object.keys(params)
        .sort()
        .forEach(key => {
          paramArr.push(`${key}=${params[key]}`);
        });
      var signContent = paramArr.join("&");
      console.log(signContent);
      // 根据secret创建签名
      const signature = crypto.createHmac("sha1", secret);
      // 得到签名信息
      return signature.update(new Buffer(signContent, "utf8")).digest("base64");
    } 
  }
};
</script>

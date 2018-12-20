<template>
<v-dialog v-model="dialog" max-width="500">
  <v-form v-model="valid" ref="form" @submit.prevent="submit">
    <v-card>
      <v-card-title>
        <div class="headline">
          <ShareIcon/>
          共享目录:{{ item.source_path }}</div>
      </v-card-title>
      <v-card-text>


        <section v-show="!showUrl">

        <v-radio-group class="small" v-model="item.type" label="授权方式" @change="typeChanged()">
          <v-radio label="访问此链接的所有用户" value="all"></v-radio>
          <v-radio label="第一个访问此链接的用户" value="one"></v-radio>
          <v-radio label="所有知道此链接的人（无需登录）" value="public"></v-radio>
        </v-radio-group>

        <v-radio-group class="small" v-model="item.privilege" label="权限" row>
          <v-radio label="只读" value="readonly"></v-radio>
          <v-radio label="读写" value="writable" v-if='item.type !== "public"'></v-radio>
          <!-- <v-radio label="读写可授权" value="grantable"></v-radio> -->
        </v-radio-group>

        <v-switch label="设置共享有效期(默认为永久)" hide-details v-model="expires_time_on">
        </v-switch>


        <v-layout row wrap v-if="expires_time_on">
         <v-flex xs12 sm6>
           <v-menu
             ref="share_menu"
             :close-on-content-click="false"
             v-model="share_menu"
             :nudge-right="40"
             :return-value.sync="share_date"
             lazy
             transition="scale-transition"
             offset-y
             full-width
             min-width="290px"
           >
             <v-text-field
               :rules="[v=>!!v||'required']"
               slot="activator"
               v-model="share_date"
               label="共享截止日期"
               prepend-icon="event"
               readonly
             ></v-text-field>
             <v-date-picker v-model="share_date" no-title scrollable
             :allowed-dates="allowedDates">
               <v-spacer></v-spacer>
               <v-btn flat color="primary" @click="share_menu = false">Cancel</v-btn>
               <v-btn flat color="primary" @click="$refs.share_menu.save(share_date)">OK</v-btn>
             </v-date-picker>
           </v-menu>
         </v-flex>
         <v-flex xs12 sm6>
            <v-menu
              ref="share_menu2"
              :close-on-content-click="false"
              v-model="share_menu2"
              :nudge-right="40"
              :return-value.sync="share_time"
              @dblclick.native="$event.stopPropogation()"
              lazy
              left
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <v-text-field
                 :rules="[v=>!!v||'required']"
                slot="activator"
                v-model="share_time"
                label="共享截止时间"
                prepend-icon="access_time"
                readonly
              ></v-text-field>
              <v-time-picker format="24hr" v-model="share_time" @change="$refs.share_menu2.save(share_time)"
              :allowed-hours="(v)=>{return this.allowedHours(v,share_date)}" >
              <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="link_menu = false">Cancel</v-btn>
                <v-btn flat color="primary" @click="$refs.link_menu.save(link_time);">OK</v-btn>
                </v-time-picker>
            </v-menu>
          </v-flex>

       </v-layout>

       <v-switch label="设置链接有效期(默认为1天)" hide-details v-model="link_expires_time_on">
       </v-switch>
        <v-layout row wrap v-if="link_expires_time_on">
         <v-flex xs12 sm6>
           <v-menu
             ref="link_menu"
             :close-on-content-click="false"
             v-model="link_menu"
             :nudge-right="40"
             :return-value.sync="link_date"
             lazy
             transition="scale-transition"
             offset-y
             full-width
             min-width="290px"
           >
             <v-text-field 
               slot="activator"
               v-model="link_date"
               label="链接过期日期"
               prepend-icon="event"
               readonly
             ></v-text-field>
             <v-date-picker v-model="link_date" no-title scrollable
             :allowed-dates="allowedDates">
               <v-spacer></v-spacer>
               <v-btn flat color="primary" @click="link_menu = false">Cancel</v-btn>
               <v-btn flat color="primary" @click="$refs.link_menu.save(link_date)">OK</v-btn>
             </v-date-picker>
           </v-menu>
         </v-flex>

         <v-flex xs12 sm6>
            <v-menu
              ref="link_menu2"
              :close-on-content-click="false"
              v-model="link_menu2"
              :nudge-right="40"
              :return-value.sync="link_time"
              @dblclick.native="$event.stopPropogation()"
              
              lazy
              left
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <v-text-field 
                slot="activator"
                v-model="link_time"
                label="链接过期时间"
                prepend-icon="access_time"
                readonly
              ></v-text-field>
              <v-time-picker format="24hr" v-model="link_time"  
               :allowed-hours="(v)=>{return this.allowedHours(v,link_date)}" 
                >
               <v-spacer></v-spacer>
                <v-btn flat color="primary" @click="link_menu2 = false">Cancel</v-btn>
                <v-btn flat color="primary" @click="$refs.link_menu2.save(link_time);">OK</v-btn>
          </v-time-picker>
            </v-menu>
          </v-flex>
       </v-layout>

       <v-textarea rows="2" placeholder="说点什么" :rules="[v=>!v||v.length<=255||'Max 255 characters']" :counter="255" v-model.trim="item.description"></v-textarea>
       </section>


       <section v-show="showUrl">
         <v-text-field readonly id="urlElm" label="共享链接" hint="请把链接发送给你要共享的人" v-model="url"></v-text-field>
       </section>

      </v-card-text>


      <v-card-actions style="border-bottom:1px solid #ccc">

        <v-spacer></v-spacer>
        <v-btn v-if="!showUrl" class="green--text darken-1" flat="flat" @click.native="dialog=false">取消</v-btn>
        <v-btn v-if="!showUrl" :disabled="!valid" @click="submit()" color="success">生成链接</v-btn>

        <v-btn v-if="showUrl" @click="copy()" class="info--text darken-1" flat="flat">复制链接</v-btn>
        <v-btn v-if="showUrl" :disabled="!valid" @click.native="dialog=false" color="success">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</v-dialog>
</template>

<script>
import Shares from '@/services/shares.js'
import F from '@/services/f.js'
import UserSelector from '@/views/_/UserSelector.vue'
import moment from 'moment'

var today = moment(new Date()).format('YYYY-MM-DD');

export default {
  components: {
    UserSelector
  },
  data() {
    return {
      valid: true,

      expires_time_on: false,
      link_expires_time_on: false,

      share_menu: false,
      share_date: undefined,
      share_menu2: false,
      share_time: undefined,

      link_menu: false,
      link_date: undefined,
      link_menu2: false,
      link_time: undefined,

      loading: false,
      showUrl: false,
      url: "",

      endpoint: Global.endpoint,
      dialog: false,

      item: {
        type: "all",
        description: '',
        share_name: '',
        expires_time: '',
        privilege: 'readonly',
        drive_id: '',
        source_path: ''
      }
    }
  },
  async mounted() {
    this.$root.$on('show::CreateShareDialog', ({
      hideSourceItems,
      item,
      callback
    }) => {
      this.link_date = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString().replace(/\//g, "-");
      this.link_time = new Date().getHours() + ":" + new Date().getMinutes();

      Object.assign(this.item, item)

      this.callback = callback;
      this.dialog = true;
      this.loading = false;
      this.showUrl = false;
      this.url = "";
    })
  },
  destroyed(){
    this.$root.$off('show::CreateShareDialog')
  },
  methods: {
    allowedDates(v){
      return v>=today;
    },
    allowedHours(v, date){
      if(date == today){
        return v>=new Date().getHours()
      }
      return true;
    },
    copy(){
      document.getElementById("urlElm").select();
      document.execCommand("copy");
      Toast.success('复制成功');
    },
    typeChanged() {
      if(this.item.type === "public"){
        this.item.privilege = "readonly";
      }
    },
    getTime(date, time){
      var currentTime = new Date().getTime();
      var setTime = new Date(date + " " + time).getTime()
      return Math.round( (setTime - currentTime) / 1000 );
    },
    async submit() {
      if(this.link_expires_time_on){
        this.item.key_expires_time = new Date(this.link_date + " " + this.link_time).toISOString();
      }
      else{
        this.item.key_expires_time = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      if(this.expires_time_on){
        if(!this.share_date || !this.share_time){
          return;
        }
        this.item.expires_time = new Date(this.share_date + " " + this.share_time).toISOString();
      }
      else{
        this.item.expires_time = "Never";
      }

      if(this.item.expires_time!='Never' && new Date(this.item.expires_time).getTime() - Date.now() < 600000){
        Toast.error('过期时间必须大于当前时间10分钟以上');
        return ;
      }

      if(this.loading){
        return ;
      }
      this.loading = true;

      Toast.info('正在生成链接...');

      try{
        var result = await Shares.share_keys(this.item);
      }catch(e){
        this.loading = false;
        return;
      }

     
      if(this.item.type === "public"){
        this.url = location.protocol + '//' + location.host + '/#/publicsharekey/' + encodeURIComponent(result.share_id) + "/token/" + encodeURIComponent(result.access_token);
      }
      else{
        this.url = location.protocol + '//' + location.host + '/#/sharekey/' + encodeURIComponent(result.key);
      }
    

      this.showUrl = true;

      Toast.success('链接生成完成');
      this.loading = false;

    }
  }
}
</script>
<style>
.input-group.small{
  padding: 0;
}
.input-group.small .input-group__details{
  display: none;
}
</style>

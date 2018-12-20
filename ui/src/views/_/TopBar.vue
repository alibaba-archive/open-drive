<template>
  <v-toolbar app dense :clipped-left="$vuetify.breakpoint.mdAndUp" :color="userInfo.is_admin?'purple darken-4':'blue darken-3'" dark>
    
    <v-toolbar-side-icon class="hidden-sm-and-down" v-if="checkShowLogin" @click.stop="$root.$emit('toggle::SideBar')"></v-toolbar-side-icon>

    <v-toolbar-title class="ma-0" style="cursor:pointer" @click="$router.push({name:'Main'})">
      <v-avatar v-if="logo_url">
        <img @click="click10" :src="logo_url">
      </v-avatar>
      
      <small>&nbsp;{{title}}</small>
    </v-toolbar-title>


    <v-spacer></v-spacer>
    <!--
      <v-btn icon>
        <v-icon>search</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>favorite</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>more_vert</v-icon>
      </v-btn> -->

    
    <v-tooltip v-if="checkShowLogin" bottom>{{F.userType(userInfo.user_type)}}
      <v-chip slot="activator" @click.stop="$router.push({name:'Mine'})">
        <v-progress-circular v-if="loading" indeterminate :size="10" color="primary"></v-progress-circular>
        <span v-else>
            <v-avatar>
              <img v-if="userInfo && userInfo.avatar_url" id="topAvatarImg" :src="userInfo.avatar_url.startsWith('http') ? userInfo.avatar_url+rand : endpoint+userInfo.avatar_url+rand" alt="trevor">
            </v-avatar>
            <span>{{userInfo.nick_name.length>3?userInfo.nick_name.substring(0,3)+'..':userInfo.nick_name}}</span>
        </span>
      </v-chip>
    </v-tooltip>


    <v-tooltip bottom>文档
      <v-btn slot="activator" icon outline :to="{name:'Docs', params: {docPath:'quickstart/guide'}}">
        <v-icon>help</v-icon>
      </v-btn>
    </v-tooltip>


 

    <v-badge overlap bottom color="red" v-if='checkShowLogin'>
      <span v-if="uploadListLen+downloadListLen>0" slot="badge">{{uploadListLen+downloadListLen>99?'...':uploadListLen+downloadListLen}}</span>
      <v-tooltip v-if="$route.name!='SignIn' && $route.name!='DingDingSignIn' && $route.name!='GetToken'" bottom>上传列表
        <v-btn slot="activator" icon outline @click.stop="$root.$emit('toggle::TransferWin')">
          <v-icon>swap_vert</v-icon>
        </v-btn>
      </v-tooltip>

    </v-badge>
 
    <v-btn style="min-width:40px" flat v-if="!userInfo.nick_name && $route.name!='SignIn' && $route.name!='DingDingSignIn'" @click.stop='goLogin()'>
      登录
    </v-btn>

    <!-- <v-btn class="hidden-sm-and-down" v-if="$route.name!='SignIn' && $route.name!='GetToken'" icon @click.stop="logout()">
        <v-icon>exit_to_app</v-icon>
      </v-btn> -->
  </v-toolbar>
</template>


<script>
  import F from '@/services/f.js'
  import Users from '@/services/users.js'
 
  var ctime = 0;
  var tid;
  export default {
    data() {
      return {
        F,
        logo_url: Global.logo,
        title: Global.title,
  
        endpoint: Global.endpoint,
        uploadListLen: 0,
        downloadListLen: 0,
        // userInfo: {
        //   user_type: '',
        //   nick_name: ''
        // },
        rand: '',
        loading: false,
      }
    },
    computed: {
       
      userInfo(){
        return this.$root.userInfo || {}
      },
      checkShowLogin(){
        if(this.$route.name=='GetToken')return false;
        return  this.userInfo && this.userInfo.nick_name?true: false;

      }
    },
    async mounted() {
      //init title & logo
      document.title= Global.title;
      // document.querySelector('link[type=favicon]').setAttribute('href', this.logo_url);
      
      this.$root.$on('refresh::UserInfoAvatar', (data) => {
        // $('#topAvatarImg').attr('src',data)
        this.loadUserInfo()
      });

      this.$root.$on('uploadListChanged', (v) => {
        this.uploadListLen = v.length
      })
      this.$root.$on('downloadListChanged', (v) => {
        this.downloadListLen = v.length
      })
     
      this.loadUserInfo()
    },
    methods: {
      click10() {
        if (!isElectron) return;
        ctime++;
        if (ctime > 10) {
          console.log('---open dev tool---');
          ASNode.openDevTools();
        }
        clearTimeout(tid)
        tid = setTimeout(function() {
          ctime = 0;
        }, 600);
      },
      goLogin() {
        localStorage.setItem("login_redirect", this.$route.path);
        this.$router.push({
          name: "SignIn"
        });
      },
       
      async loadUserInfo() {
      
        var userInfo;
        this.loading = true;
        try {
          userInfo = await Users.getUserInfo({
            ignoreError: true
          });
        } catch (e) {
          userInfo = {};
        }
        //await delay(1000)
        
        this.$root.userInfo = clone(userInfo); 

        this.$root.$emit('load::UserInfo', clone(userInfo));
        this.rand = '?r=' + Math.random()
        this.loading = false;

      },
      logout() {

        Users.logout()
        window.location.href = '/'
      }
    }
  }
</script>

<style scoped>
  /* .application .theme--dark.toolbar,
  .theme--dark .toolbar {
    z-index: 999;
  } */
</style>

<template>
  <v-navigation-drawer clipped fixed class="hidden-sm-and-down" hide-overlay v-if="visible"
   mobile-break-point="960" width="240" v-model="drawer" app :mini-variant.sync="mini">

    <div v-if="loading" class="text-xs-center mt-5">
      <v-progress-circular indeterminate :size="50" color="primary"></v-progress-circular>
    </div>

    <v-toolbar v-if="!loading" flat class="transparent" dense>
      <v-list class="pa-0">
        <v-list-tile  class="pa-0">
          <v-list-tile-avatar :size="36">
            <img @click="$router.push({name:'Mine'})" v-if="userInfo.avatar_url" :src="userInfo.avatar_url.startsWith('http') ? userInfo.avatar_url+rand : endpoint+userInfo.avatar_url+rand">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title style="cursor:pointer" @click.stop="$router.push({name:'Mine'})">{{userInfo.nick_name}}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon @click.native.stop="mini = !mini">
              <v-icon>chevron_left</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>

      </v-list>
    </v-toolbar>

      <v-divider></v-divider>
    <v-list v-if="!loading" dense>

      <v-list-tile v-for="item in items" :key="item.path" @click="$router.push({path:item.path})"
      :class="$route.path.startsWith(item.path)?'blue lighten-4':''">
        <v-list-tile-action>


          <DriveIcon v-if="item.icon=='DriveIcon'" />
          <ShareIcon v-else-if="item.icon=='ShareIcon'" />
          <StorageIcon v-else-if="item.icon=='StorageIcon'" /> 
          <UserIcon v-else-if="item.icon=='UserIcon'" />
          <AdminIcon v-else-if="item.icon=='AdminIcon'" />


        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>{{item.text}}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>

    </v-list>
  </v-navigation-drawer>
</template>

<script>
  var USER_MENU = [{
    path: '/drives',
    text: '我的云盘',
    icon: 'DriveIcon'
  }, {
    path: '/shares',
    text: '与我共享',
    icon: 'ShareIcon'
  }];

  var ADMIN_MENU = [{
    path: '/storages',
    text: '存储配置',
    icon: 'StorageIcon'
  }, {
    path: '/drives',
    text: '我的云盘',
    icon: 'DriveIcon'
  }, {
    path: '/shares',
    text: '与我共享',
    icon: 'ShareIcon'
  }];
 

  ADMIN_MENU = [...ADMIN_MENU,{
    path: '/users',
    text: '用户列表',
    icon: 'UserIcon'
  }, {
    path: '/admins',
    text: '管理员列表',
    icon: 'AdminIcon'
  }]

  export default {
    data() {
      return {
        endpoint: Global.endpoint,
        mini: false,
        drawer: false,
        items: clone(USER_MENU),
        loading: true,
        rand: '?&r=' + Math.random()
      }
    },
    watch: {
      '$root.userInfo' (v) {
         this.initMenu()
      }
    },
    computed: {
      visible(){
        return ['SignIn','DingDingSignIn', 'GetToken','Docs'].indexOf(this.$route.name)==-1
        
      },
      userInfo() {
        return this.$root.userInfo||{}
      }
    },
    async mounted() { 
      this.initMenu();
      this.$root.$on('toggle::SideBar', (v) => { 
        if (v == null) this.drawer = !this.drawer
        else this.drawer = !!v;
      });
      this.$root.$on('refresh::UserInfoAvatar', (data) => {
        this.rand = '?&r=' + Math.random();
      }); 
    },
    methods: {
      initMenu() {
        
        if (!this.$root.userInfo) return;
        if (!this.$root.userInfo.nick_name) {
          this.drawer = false;
          return;
        }
        this.drawer = true;
        if (this.$root.userInfo.is_admin) {
          this.items = clone(ADMIN_MENU)
        } else {
          this.items = clone(USER_MENU)
        }
        this.loading = false;
      }
    }
  }
</script>

<template>
  <div>
    <div class="hidden-md-and-up" style="height:60px"></div>
    <v-bottom-nav v-if="visible" fixed class="hidden-md-and-up bottom-nav--fixed" :value="1" :active.sync="nav" absolute color="white">

      <v-btn v-for="(menu,index) in menus" v-if="menus.length<=5 || menus.length>5 && index<4" flat color="info" :key="menu.value" :value="menu.value" @click="$router.push({path: menu.path})">
        <span>{{menu.text}}</span>
        <StorageIcon v-if="menu.icon=='StorageIcon'" class="info--text" />
        <DriveIcon v-if="menu.icon=='DriveIcon'" class="info--text" />
        <ShareIcon v-if="menu.icon=='ShareIcon'" class="info--text" /> 
        <UserIcon v-if="menu.icon=='UserIcon'" class="info--text" />
        <AdminIcon v-if="menu.icon=='AdminIcon'" class="info--text" />
      </v-btn>

      <v-menu left top offset-y>
        <v-btn slot="activator" v-if="menus.length>5" flat color="info">
          <span>更多</span>
          <v-icon>more_vert</v-icon>
        </v-btn>

        <v-list>
          <v-list-tile avatar v-for="(menu, index) in menus" v-if="index>=4" :key="index" @click="$router.push({path:menu.path})">
            <v-list-tile-avatar>
              <StorageIcon v-if="menu.icon=='StorageIcon'" class="info--text" />
              <DriveIcon v-if="menu.icon=='DriveIcon'" class="info--text" />
              <ShareIcon v-if="menu.icon=='ShareIcon'" class="info--text" /> 
              <UserIcon v-if="menu.icon=='UserIcon'" class="info--text" />
              <AdminIcon v-if="menu.icon=='AdminIcon'" class="info--text" />

            </v-list-tile-avatar>
            <v-list-tile-title>{{ menu.text }}</v-list-tile-title>
          </v-list-tile>
        </v-list>

      </v-menu>
 
    </v-bottom-nav>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nav: "drives" 
    };
  },
  watch: {
    "$route.path"(v) {
      this.renderNav();
    }
  },

  computed: {
    visible() {
      return (['SignIn','DingDingSignIn', 'GetToken', 'Docs'].indexOf(this.$route.name)==-1)
    },
    menus() {
      var arr = [];
      var admin = this.$root.userInfo && this.$root.userInfo.is_admin;
      if (admin) {
        arr.push({
          path: "/storages",
          text: "存储配置",
          value: "storages",
          icon: "StorageIcon"
        });
      }

      arr.push({
        path: "/drives",
        value: "drives",
        text: "我的云盘",
        icon: "DriveIcon"
      });
      arr.push({
        path: "/shares",
        value: "shares",
        text: "与我共享",
        icon: "ShareIcon"
      });
 

      if (admin) {
        arr.push({
          value: "users",
          path: "/users",
          text: "用户",
          icon: "UserIcon"
        });
        arr.push({
          value: "admins",
          path: "/admins",
          text: "管理员",
          icon: "AdminIcon"
        });
      }

      return arr;
    }
  },
  mounted() {
    this.renderNav();
  },
  methods: {
    renderNav() {
      var p = this.$route.path;
      // p = p.match(/(^\/groups\/[^\/]+)?(.*)/)[2];
      var type = p.replace(/^\//, "").split("/")[0];
      this.nav = type;
    }
  }
};
</script>

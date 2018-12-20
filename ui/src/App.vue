<template>
  <v-app style="overflow:hidden">

    <SideBar v-if="!noSiderBar && showSide"></SideBar>
    <TopBar v-if="$route.name!='GetToken'"></TopBar>

    <v-content>
      <router-view :key="key"></router-view>
    </v-content>
    <BottomBar v-if="showSide && $route.name!='Docs'"></BottomBar>
    <DocSideBar v-if="$route.name=='Docs'"/>

    <ToastStack></ToastStack>
    <DialogStack></DialogStack>

    <TransSiteBar></TransSiteBar>
    <SettingDialog></SettingDialog>

  </v-app>

</template>

<script>
import TopBar from "./views/_/TopBar.vue";
import SideBar from "./views/_/SideBar.vue";
import ToastStack from "@/views/_/ToastStack.vue";
import DialogStack from "@/views/_/DialogStack.vue";
import TransSiteBar from "@/views/_/TransSiteBar";
import SettingDialog from "@/views/_/SettingDialog";
import BottomBar from "@/views/_/BottomBar";
import DocSideBar from "@/views/docs/DocSideBar";

export default {
  name: "App",
  components: {
    DocSideBar,
    TopBar,
    SideBar,
    BottomBar,
    TransSiteBar,
    ToastStack,
    DialogStack,
    SettingDialog
  },
  computed: {
    showSide() {
      return !!this.userInfo.nick_name;
    },
    noSiderBar() {
      const { name, path } = this.$route;
      return (
        ["GetToken", "SignIn", "DingDingSignIn"].indexOf(name) > -1 
      );
    },
    key() {
      return this.$route.name !== undefined
        ? this.$route.name + new Date()
        : this.$route + new Date();
    },
    userInfo() {
      return this.$root.userInfo || {};
    }
  }
};
</script>

<style lang="less">
html {
  overflow: auto;
}
.v-btn-icon.v-btn-small.v-btn {
  min-width: 28px;
}

.v-item-group.v-bottom-nav .v-btn,
.v-bottom-nav .v-item-group.v-bottom-nav .v-btn{
  min-width: 28px !important;
}

.op-btns .v-btn {
  /* min-width:28px;
  margin: 1px 4px; */
}
.disabled-item-name {
  text-decoration: line-through;
}
.truncate {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.v-icon.fa {
  font-size: 140%;
}
</style>

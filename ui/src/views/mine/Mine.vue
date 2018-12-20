<template>
  <v-container fluid grid-list-sm class="pa-0">
    <v-layout row>
      <v-flex xs12 md6 offset-md3 sm8 offset-sm2 class="pt-4">

        <v-card v-if="userInfo">
          <v-card-text class="text-xs-center">

            <v-avatar :size="180" style="position:relative;overflow:hidden;">
              <img id="imgPrev" :src="userInfo.avatar_url.startsWith('http') ? userInfo.avatar_url : endpoint+userInfo.avatar_url" alt="头像" />
              <input accept="image/*" @change="chooseImageChange($event)" id="imgfile" type="file" style="cursor:pointer;opacity:0.01;position:absolute;z-index:10;width:100%;height:100%;" />
            </v-avatar>

          </v-card-text>
          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">{{userInfo.nick_name}}
                <small><small>({{F.userType(userInfo.user_type)}})</small></small>
              </h3>
              <div>ID:{{userInfo.user_id}}</div>
              <div>
                ( <span v-if="!userInfo.is_admin">普通用户</span>
                <span v-else :class="F.privilegeFormat(userInfo.privilege,1)+'--text'">管理员:{{F.privilegeFormat(userInfo.privilege)}}
                </span> )

              </div>
            </div>
          </v-card-title>
          <v-list>
            <v-divider />

            <v-list-tile  @click.stop="$root.$emit('show::setting')"> 
              <v-list-tile-avatar>
                <v-icon>settings</v-icon>
              </v-list-tile-avatar>

              <v-list-tile-content>
                <v-list-tile-title>设置</v-list-tile-title> 
              </v-list-tile-content>
              <!-- <v-list-tile-action>
                <v-btn icon ripple >
                  <v-icon color="grey lighten-1">info</v-icon>
                </v-btn>
              </v-list-tile-action> -->
            </v-list-tile>

            
          </v-list>
          <v-divider />

          <v-card-actions>
            <v-btn block color="error" @click.stop="logout">退出登录</v-btn>
          </v-card-actions>

        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import F from "@/services/f.js";
import Users from "@/services/users.js";

export default {
  data() {
    return {
      F,
      endpoint: Global.endpoint
    };
  },
  computed: {
    userInfo() {
      return this.$root.userInfo;
    }
  },
  mounted() {},
  methods: {
    logout() {
      Users.logout();
    },
    chooseImageChange(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      var image = new Image();
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      reader.onload = () => {
        //文件加载完成
        var url = reader.result;
        image.src = url;
      };
      image.onload = () => {
        //图片加载完成
        var w = image.naturalWidth;
        var h = image.naturalHeight;
        var scale = 3; //3: 图片缩放比例，这里是把图片大小高宽均缩小3倍
        canvas.width = w / scale;
        canvas.height = h / scale;
        ctx.drawImage(image, 0, 0, w, h, 0, 0, canvas.width, canvas.height);

        this.uploadFile(file.type, canvas);
      };
      reader.readAsDataURL(file);
    },
    async uploadFile(type, canvas) {
      var quality = 0.1; //图片的质量，这里设置的是0.3
      var data = canvas.toDataURL(type, quality); //获取画布图片，并且要jpg格式
      // this.userInfo.avatar_url = data;
      $("#imgPrev").attr("src", data);
      Toast.info("正在修改头像");
      await Users.updateAvatar(data);
      Toast.success("修改头像成功");
      //await delay(1000)
      this.$root.$emit("refresh::UserInfoAvatar");
    }
  }
};
</script>

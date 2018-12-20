<template>
  <v-form v-model="valid" ref="form5" lazy-validation @submit.prevent="next">

    <v-card class="elevation-0 mt-2">
      <v-toolbar dense flat>
        <v-toolbar-title>确认信息(完成)</v-toolbar-title>

        <v-spacer></v-spacer>

      </v-toolbar>
      <v-card-text>


        <h3 class="my-2">基础配置</h3>

        <div><span class="grey--text">名称:</span> <b>{{info.storage_name}}</b></div>
        <div><span class="grey--text">描述:</span> <b>{{info.description}}</b></div>

        <h3 class="my-2">AK & Region</h3>

        <div><span class="grey--text">区域:</span> <b>{{info.region}}</b></div>
        <div><span class="grey--text">角色arn:</span> <b>{{info.role_arn}}</b></div>
        <div><span class="grey--text">AccessKeyId:</span> <b>{{info.access_key_id}}</b></div>
        <div><span class="grey--text">AccessKeySecret:</span> <b>{{F.hideSecret(info.access_key_secret)}}</b></div>

        <h3 class="my-2">存储配置</h3>


        <div><span class="grey--text">OSS路径:</span> <b>{{info.oss_path}}</b></div>

        <section v-if="info.init_drive_on">
         <h3 class="my-2">初始化云盘</h3>

        <div><span class="grey--text">云盘名称:</span> <b>{{info.init_drive_name}}</b></div>
        <div><span class="grey--text">云盘大小:</span> <b>{{info.init_drive_size}}</b></div>
        </section>
 


      </v-card-text>
    </v-card>

    <v-toolbar dense flat color="white">
      <v-btn color="white" @click="pre">
        <v-icon>arrow_back</v-icon> 上一步</v-btn>
      <v-spacer/>
      <v-btn type="submit" color="info">提交
        <v-icon>check</v-icon>
      </v-btn>
    </v-toolbar>

  </v-form>
</template>

<script>
import F from '@/services/f.js'
export default {
  props: ["info"],
  data() {
    return {
      F,
      valid: true
    };
  },
  methods: {
    pre() {
      this.$emit("pre");
    },
    next() {
      //if (!this.$refs.form5.validate()) return;
      this.$emit("next", this.item);
    }
  }
};
</script>

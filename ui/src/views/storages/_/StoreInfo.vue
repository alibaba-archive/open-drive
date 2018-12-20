
<template>
  <v-form v-model="valid" ref="form3" lazy-validation @submit.prevent="next">



    <v-text-field :label="`OSS Path (注意区域: ${region})`" v-model.trim="item.oss_path" :rules="osspathRules" required placeholder="oss://bucket/key/"></v-text-field>


    <v-card class="elevation-6">
      <v-toolbar dense flat>
        <v-toolbar-title>初始化云盘配置(可选)</v-toolbar-title>
        <small>开启后所有登录的用户都有云盘</small>
        <v-spacer></v-spacer>

        <v-switch color="success" class="mt-4" :label="item.init_drive_on?'开启':'禁用'" v-model="item.init_drive_on"></v-switch>

      </v-toolbar>
      <v-card-text v-if="item.init_drive_on">

        <v-text-field label="云盘统一名称" :rules="[v=>!!v||'Required', v=>v.length<=20||'Max 20 characters']" :counter="20" v-model.trim="item.init_drive_name"></v-text-field>
        <v-text-field label="分配空间大小(单位:MB)" :rules="[v=>!!v||'Required',v=>(''+v).indexOf('.')==-1||'It must be an integer']" :min="1" type="number" v-model="item.init_drive_size"></v-text-field>

      </v-card-text>
    </v-card>

    <v-toolbar dense flat color="white">
      <v-btn color="white" @click="pre">
        <v-icon>arrow_back</v-icon> 上一步</v-btn>
      <v-spacer/>
      <v-btn type="submit" color="info">下一步
        <v-icon>arrow_forward</v-icon>
      </v-btn>
    </v-toolbar>

  </v-form>
</template>

<script>
  export default {
    props: ["info"],
    watch: {
      info: {
        deep:true, handler(){

        }
      }
    },
    data() {
      return {
        valid: false,

        item: {


          "oss_path": '',
          "oss_bucket": "",
          "oss_key": "",

          //optionals
          "init_drive_on": false,
          "init_drive_name": '',
          "init_drive_path_prefix": '/',
          "init_drive_size": 0,
          "init_drive_privilege": 'readonly',

        },

        osspathRules: [
          v => !!v || 'OSS Path is required',
          v => (v && /^oss\:\/\/([^/]+\/)+/.test(v)) || 'It must starts with oss:// and ends with /'
        ],
      };
    },
    computed: {
      region(){
        return this.info.region
      }
    },
    methods: {
      pre() {
        this.$emit('pre')
      },
      next() {
        if (!this.$refs.form3.validate()) return;
        this.$emit('next', this.item)
      }
    }
  };
</script>

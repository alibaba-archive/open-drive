
<template>
  <v-form v-model="valid" ref="form2" lazy-validation @submit.prevent="next">

    <v-select required label="Region" v-model="item.region" :items="regions" item-value="value" item-text="text"></v-select>

    <v-text-field label="Role Arn" persistent-hint hint="(此角色需要 OSS 读写权限,请前往 <a onclick=window.openURL('https://ram.console.aliyun.com') href='javascript:void(0)'>RAM 控制台</a> 创建)`" v-model.trim="item.role_arn" :rules="arnRules" required placeholder="以 acs:ram: 开头"></v-text-field>
    <v-text-field label="子账号 AccessKeyId" persistent-hint :hint="`(需要 STSAssumeRole 和 OSSFull权限，可选 IMMFull 权限)`" v-model.trim="item.access_key_id" required></v-text-field>
    <v-text-field label="子账号 AccessKeySecret" v-model.trim="item.access_key_secret" required></v-text-field>

    <v-toolbar dense flat color="white">
      <v-btn color="white" @click="pre"><v-icon>arrow_back</v-icon> 上一步</v-btn>
      <v-spacer/>
      <v-btn type="submit"  color="info">下一步 <v-icon>arrow_forward</v-icon></v-btn>
    </v-toolbar>

  </v-form>
</template>

<script>
  const availableRegions = JSON.parse(JSON.stringify(window.Global.available_regions))

  export default {
    data() {
      return { 
        valid: false,

        regions: availableRegions,

        item: {
          region: availableRegions[0].value,

          "account_id": "",
          "role_arn": "",
          "sts_endpoint": "https://sts.aliyuncs.com",

          "access_key_id": "",
          "access_key_secret": "",

        },
        arnRules: [
          v => !!v || 'Role arn is required',
          v => (v && /^acs\:ram\:/.test(v)) || 'It must starts with acs:ram:'
        ],
      }
    },
    methods: {
      pre() {
        this.$emit('pre')
      },
      next() {
        if (!this.$refs.form2.validate()) return;
        this.$emit('next', this.item)
      }
    }
  }
</script>

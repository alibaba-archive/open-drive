<template>
<v-container fluid grid-list-sm class="pa-0">
  <v-layout row>
    <v-flex xs12>

      <v-form v-model="valid" ref="form" lazy-validation @submit.prevent="submit">
        <v-card>
          <v-toolbar dense flat>
            <v-btn small icon :to="{name:'Storages'}">
              <v-icon>arrow_back</v-icon>
            </v-btn>

            <StorageIcon/>
            <!-- <v-toolbar-side-icon></v-toolbar-side-icon> -->
            <v-toolbar-title>{{isUpdate?'修改存储配置':'创建存储配置'}}
            </v-toolbar-title>

            <!-- <v-toolbar-title>空间列表 ({{searchResult.length}}<span v-if="searchResult.length<storages.length">/{{storages.length}}</span>)</v-toolbar-title> -->
            <v-spacer></v-spacer>
 

            <v-tooltip v-if="item.root_drive_id" bottom>进入根云盘
              <v-btn slot="activator" class="ma-0" icon flat color="info" @click.prevent.stop="showRootDrive(item)">
                <DriveIcon/>
              </v-btn>
            </v-tooltip>


            <!-- <v-tooltip v-if="isUpdate && userInfo && userInfo.privilege!='readonly'" bottom>创建根云盘
              <v-btn slot="activator" class="ma-0"  icon flat color="green" @click.prevent.stop="showAddDrive(item)">
                <v-icon>add</v-icon>
              </v-btn>
            </v-tooltip> -->

            <v-tooltip v-if="isUpdate && userInfo && userInfo.privilege!='readonly'" bottom>删除
              <v-btn slot="activator" class="ma-0"  icon flat color="error" @click.prevent.stop="showDelete(item)">
                <v-icon>close</v-icon>
              </v-btn>
            </v-tooltip>

          </v-toolbar>


          <v-card-text class="pa-1">
            <Loading v-if="loading"/>
            <v-container v-else fluid grid-list-xs class="pa-0">
              <v-layout row wrap>
                <v-flex xs12 sm10 lg6>


                  <v-card class="elevation-6">
                    <v-toolbar dense flat>

                      <v-toolbar-title>基础配置</v-toolbar-title>
                      <v-spacer></v-spacer>

                    </v-toolbar>

                    <v-card-text>

                      <v-text-field :disabled="isUpdate" label="Storage 名称" v-model.trim="item.storage_name" :rules="nameRules" :counter="10" required></v-text-field>


                      <v-select
                      v-if="!isUpdate || item.region"  :disabled="isUpdate" required
                      label="Region"
                      v-model="item.region"
                      :items="regions"
                      item-value="value" item-text="text"
                      ></v-select>

                      <!-- <v-text-field v-if="!isUpdate || item.region" :disabled="isUpdate" label="Region" v-model.trim="item.region" required></v-text-field> -->
                      <v-text-field v-if="isUpdate && item.oss_endpoint" :disabled="isUpdate" label="OSS Endpoint" v-model.trim="item.oss_endpoint" :rules="endpointRules" required></v-text-field>
                      <v-text-field :disabled="isUpdate" label="OSS Path" v-model.trim="item.oss_path" :rules="osspathRules" required placeholder="oss://bucket/key/"></v-text-field>

                      <v-textarea rows="2" placeholder="备注（100字）" :rules="descRules" :counter="100" label="备注:" v-model="item.description"></v-textarea>
                      <!-- <v-text-field label="Account Id" v-model.trim="item.account_id" required></v-text-field> -->
                      <v-text-field label="Role Arn" hint="(此角色需要 OSS 读写权限)" v-model.trim="item.role_arn" :rules="arnRules" required placeholder="以 acs:ram: 开头"></v-text-field>
                      <v-text-field label="子账号 AccessKeyId" hint="(需要 STSAssumeRole 和 OSSFull权限，可选 IMMFull 权限)" v-model.trim="item.access_key_id" required></v-text-field>
                      <v-text-field label="子账号 AccessKeySecret" v-model.trim="item.access_key_secret" required></v-text-field>
                      <!-- <v-text-field label="AccessKeySecret" :type="isPwd?'password':'text'" v-model="item.access_key_secret" required
        :append-icon="isPwd ? 'visibility_off' : 'visibility'"
         @click:append="() => (isPwd=!isPwd)"></v-text-field> -->
                    </v-card-text>
                  </v-card>
                </v-flex>
                <v-flex xs12 sm10 lg6>
                   <v-card :class="item.init_drive_on?'elevation-6':'elevation-0'">
                    <v-toolbar dense flat :class="item.init_drive_on?'':'white grey--text lighten-4'">

                      <v-toolbar-title>初始化云盘配置</v-toolbar-title>
                      <small>(可选,所有登录的用户都有云盘)</small>
                      <v-spacer></v-spacer>

                      <v-switch color="success" class="mt-4" :disabled="isUpdate" :label="item.init_drive_on?'开启':'禁用'" v-model="item.init_drive_on"></v-switch>

                    </v-toolbar>
                    <v-card-text v-if="item.init_drive_on">

                      <v-text-field :disabled="isUpdate" label="云盘统一名称" :rules="[v=>!!v||'Required', v=>v.length<=20||'Max 20 characters']"  :counter="20" v-model.trim="item.init_drive_name"></v-text-field>
                      <!-- <v-text-field :disabled="isUpdate" label="云盘存储路径前缀 (后面会自动拼上UserId)" v-model.trim="item.init_drive_path_prefix" required></v-text-field> -->
                      <v-text-field label="分配空间大小(单位:MB)" :rules="[v=>!!v||'Required',v=>(''+v).indexOf('.')==-1||'It must be an integer']" :min="1" type="number" v-model="item.init_drive_size"></v-text-field>
                      <!-- <v-radio-group :disabled="isUpdate" required v-model="item.init_drive_privilege" label="权限" row>
                        <v-radio label="只读" value="readonly"></v-radio>
                        <v-radio label="读写" value="writable"></v-radio>
                        <v-radio label="可授权" value="grantable"></v-radio>
                      </v-radio-group> -->


                    </v-card-text>
                  </v-card>

                   

                  <v-btn v-if="userInfo && userInfo.privilege!='readonly'" type="submit" :disabled="!valid" color="info">提交</v-btn>
                </v-flex>
              </v-layout>
            </v-container>

          </v-card-text>
        </v-card>


      </v-form>

      <CreateDriveDialog></CreateDriveDialog>

    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import Storages from '@/services/storages.js'
import CreateDriveDialog from '../files/CreateDriveDialog'
import F from '@/services/f.js'


const availableRegions = JSON.parse(JSON.stringify(Global.available_regions))

export default {
  components: {
    CreateDriveDialog
  },
  data() {
    return {
      isPwd: true,
      valid: false,
      loading: false,
      isUpdate: false,
      // notify_url: Global.endpoint.replace(/\/*$/g,'') + '/notification',

      endpoint: Global.endpoint,

      regions: availableRegions,

      item: {
        region: availableRegions[0].value,
        "storage_name": "",
        // "status": "enabled",
        "description": "",
        //"oss_endpoint": "",
        "oss_path": '',
        "oss_bucket": "",
        "oss_key": "",
        // "account_id": "",
        "role_arn": "",
        "sts_endpoint": "https://sts.aliyuncs.com",
        "access_key_id": "",
        "access_key_secret": "",
        //optionals
        "init_drive_on": false,
        "init_drive_name": '',
       
        "init_drive_size": 0,
        
      },

      nameRules: [
        v => !!v || 'Storage Name is required',
        v => (v && v.length <= 10) || 'It must be less than 10 characters'
      ],
      descRules: [
        v => !v || (v && v.length <= 100) || 'It must be less then 100 characters'
      ],
      endpointRules: [
        v => !!v || 'OSS Endpoint is required',
        v => (v && /^http(s)?\:\/\//.test(v)) || 'It must starts with http:// or https://'
      ],
      osspathRules: [
        v => !!v || 'OSS Path is required',
        v => (v && /^oss\:\/\/([^/]+\/)+/.test(v)) || 'It must starts with oss:// and ends with /'
      ],
      arnRules: [
        v => !!v || 'Role arn is required',
        v => (v && /^acs\:ram\:/.test(v)) || 'It must starts with acs:ram:'
      ],
 
    }
  },
  computed: {
    userInfo() {
      return this.$root.userInfo
    }
  },
  async mounted() {

    this.storageId = this.$route.params.storageId;
    this.isUpdate = !!this.$route.params.storageId;


    if (this.isUpdate) {
      this.loading=true;
      var item = await Storages.get(this.storageId) 
      item.init_drive_on = (item.init_drive_on+'') === "true" ? true : false;
      

      if (item.init_drive_on) {
        item.init_drive_size = item.init_drive_size / 1024/1024
      }
      item.oss_path = `oss://${item.oss_bucket}/${item.oss_key}`;
      Object.assign(this.item, item)
      //console.log(item)
      this.loading=false;
    }
  },
  methods: {
    async submit() {
      if(!this.userInfo|| this.userInfo.privilege=='readonly')return;

      if (!this.$refs.form.validate()) return;

      Toast.info(this.isUpdate ? '正在修改...' : '正在添加...');
      var item = clone(this.item)

      var {
        bucket,
        key
      } = F.parseOssPath(item.oss_path)
      item.oss_bucket = bucket;
      item.oss_key = key;

      if (!item.init_drive_on || item.init_drive_size <= 0) {
        item.init_drive_size = 0;
      } else {
        item.init_drive_size = item.init_drive_size * 1024 * 1024
      }

      await Storages.update(item);
      if (this.isUpdate) {
        Toast.success('修改成功')
      } else {
        Toast.success('添加成功');
      }
      this.$router.push({
        name: "Storages"
      });
    },
    async showAddDrive(item) {
      var storageName = item.storage_name;
      this.$root.$emit('show::CreateDriveDialog', {
        item: {
          description: storageName,
          drive_name: storageName,
          grant_to: this.userInfo.user_id,
          privilege: 'grantable',
          storage_name: storageName,
          storage_id: item.storage_id,
          // source_path: '/',
        },
        hideSourceItems: true,
        callback: async () => {

        }
      })

    },
    async showDelete(item) {
      var b = await Dialog.confirm('<span class="error--text">删除存储配置</span>',
            `有关联的云盘则无法删除存储配置，确定删除存储配置: <b>${item.storage_name}</b>?`)
      if(!b)return;

      Toast.info('正在删除...')
      await Storages.del(item.storage_id)


      // try{
      //   await Storages.del(item.storage_id)
      // }catch(e){
      //   if(e.data.code=='NotEmpty'){

      //     await delay(600);

      //     var b2 = await Dialog.confirm('<span class="error--text">强制删除存储配置</span>',
      //           `将强制删除所有关联的云盘将不能访问，确定删除存储配置: <b>${item.storage_name}</b>?`)
      //     if(!b2)return;

      //     Toast.info('正在删除...')

      //     try{
      //       await Storages.del(item.storage_id, true)
      //     }catch(e2){
      //       return;
      //     }
      //   }
      //   else return;
      // }
      Toast.success('删除存储配置成功')

      this.$router.push({
        name: 'Storages'
      })
    },
    async showRootDrive(item){
      var storageId = item.storage_id;
      var driveId = item.root_drive_id;
      if(driveId){
        this.$router.push({name:'StorageDrive', params:{storageId, driveId}})
      }
    }
  }
}
</script>

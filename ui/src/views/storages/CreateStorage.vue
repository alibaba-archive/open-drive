<template>
  <v-container fluid grid-list-sm class="pa-0">
    <v-layout row>
      <v-flex xs12>


        <v-card>
          <v-toolbar dense flat>
            <v-btn small icon :to="{name:'Storages'}">
              <v-icon>arrow_back</v-icon>
            </v-btn>

            <StorageIcon/>
            <v-toolbar-title>创建存储配置</v-toolbar-title>

          </v-toolbar>

          <v-stepper v-if="userInfo.privilege!='readonly'" v-model="step">
            <v-stepper-header>
              <v-stepper-step step="1" :complete="step>1">基础配置</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="2" :complete="step>2">AK & Region</v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step step="3" :complete="step>3">存储配置</v-stepper-step>
              <v-divider></v-divider> 
              <v-stepper-step step="4" :complete="step>4">确认</v-stepper-step>
            </v-stepper-header>

            <v-stepper-items>
              <v-stepper-content step="1">
                <BaseInfo @next="(v)=>{ Object.assign(this.item,v); this.step='2'}"></BaseInfo>
              </v-stepper-content>

              <v-stepper-content step="2">
                <AkInfo @pre="()=>{ this.step = parseInt(this.step)-1 }" @next="(v)=>{ Object.assign(this.item,v); this.step='3' }"></AkInfo>
              </v-stepper-content>

              <v-stepper-content step="3">
                <StoreInfo :info="item"
                @pre="()=>{ this.step = parseInt(this.step)-1 }" @next="(v)=>{ Object.assign(this.item,v); this.step='4' }"></StoreInfo>
              </v-stepper-content>
 
              <v-stepper-content step="4">
               <Complete :info="item"
                @pre="()=>{ this.step = parseInt(this.step)-1 }" @next="(v)=>{ Object.assign(this.item,v); this.submit()  }"></Complete>
              </v-stepper-content>
            </v-stepper-items>

          </v-stepper>

          <v-card-text v-else class="pa-1">
            没有权限
          </v-card-text>
        </v-card>

        <CreateDriveDialog></CreateDriveDialog>

      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import Storages from '@/services/storages.js'
  import CreateDriveDialog from '../files/CreateDriveDialog'

  import F from '@/services/f.js'
  import BaseInfo from './_/BaseInfo'
  import AkInfo from './_/AkInfo'
  import StoreInfo from './_/StoreInfo' 
  import Complete from './_/Complete'

  const availableRegions = JSON.parse(JSON.stringify(Global.available_regions))

  export default {
    components: {
      BaseInfo,
      AkInfo,
      StoreInfo, 
      Complete,
      CreateDriveDialog
    },
    data() {
      return {
        step: "1",
        isPwd: true,
        valid: false,
        endpoint: Global.endpoint,

        regions: availableRegions,

        item: {
          region: availableRegions[0].value,
          "storage_name": "",

          "description": "",
         
          "oss_path": '',
          "oss_bucket": "",
          "oss_key": "",
          //"account_id": "",
          "role_arn": "",
          "sts_endpoint": "https://sts.aliyuncs.com",

          "access_key_id": "",
          "access_key_secret": "",
          //optionals
          "init_drive_on": false,
          "init_drive_name": '',
          "init_drive_path_prefix": '/',
          "init_drive_size": 0,
          "init_drive_privilege": 'readonly',
        },
      }
    },
    computed: {
      userInfo() { 
        return this.$root.userInfo||{}
      }
    },
    
    async mounted() { 
      this.storageId = this.$route.params.storageId;
    },
    methods: {
      async submit() {
        if (this.userInfo.privilege == 'readonly') return;


        Toast.info('正在添加...');
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
        Toast.success('添加成功');

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
            source_path: '/',
          },
          hideSourceItems: true,
          callback: async() => {

          }
        })

      },
      async showDelete(item) {
        var b = await Dialog.confirm('<span class="error--text">删除存储配置</span>',
          `有关联的云盘则无法删除存储配置，确定删除存储配置: <b>${item.storage_name}</b>?`)
        if (!b) return;

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
      }
    }
  }
</script>

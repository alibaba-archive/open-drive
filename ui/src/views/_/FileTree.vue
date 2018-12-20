<template>
  <div>
    <v-layout align-center>
      <v-flex xs6>
        <v-text-field
          readonly
          :value="value"
          :label="label"
          :name="name"
          :error-messages="errorMessages"
        ></v-text-field>
      </v-flex>
      <v-flex xs1>
        <v-btn small @click="start">选择路径</v-btn>
      </v-flex>
    </v-layout>
    <v-dialog title="选择文件" width="500px" v-model="dialogVisible" scrollable>
      <div class="tree-view">
        <v-card>
          <v-card-title class="headline lighten-2" primary-title>
            <v-container grid-list-md>
              <v-layout>
                <v-flex md9>
                  <span class="curr-path pl-3">{{ currDir }}</span>
                </v-flex>
                <v-flex md3>
                  <v-btn style="float: right;" @click="goBack" small>返回上一级</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="card-text">
            <div
              v-for="(file, index) in files"
              :key="file.name"
              @dblclick="loadDir(file)"
              @click="select(file, index)"
              :class="[{ selected: file.selected }, 'text item']"
            >
              <v-icon blue-grey v-if="file.type === 'folder'">folder</v-icon>
              <v-icon blue-grey v-else>assignment</v-icon>
              {{file.name}}
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="dialogVisible = false" small>取 消</v-btn>
            <v-btn color="primary" @click="confirm" small>确 定</v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import File from '@/services/files';
export default {
  $_veeValidate: {
    value() {
      return this.value;
    },
    name() {
      return this.name;
    }
  },
  props: ['errorMessages', 'name', 'label', 'driveData', 'value'],
  data() {
    return {
      dialogVisible: false,
      path: '', // 当前选中文件或文件夹的路径
      files: [],
      currDir: '/' // 当前展开的目录，用于显示在弹框头部
    };
  },
  methods: {
    async listFile(path) {
      const { driveId } = this.driveData;
      const { items } = await File.list('drive', driveId, {
        dir_path: path,
        limit: 100
      });

      this.files = items.map(item => {
        return {
          selected: false,
          ...item
        };
      });
    },
    start() {
      const me = this;
      this.dialogVisible = true;
      const { driveId } = this.driveData;
      this.listFile('/');
      this.currDir = '/';
    },
    loadDir(file) {
      // 加载目录文件结构
      if (file.type === 'folder') {
        this.listFile(file.path);
        this.path = '';
        this.currDir = file.path;
      }
    },
    select(file, index) {
      const me = this;
      me.files.forEach(file => {
        if (file.selected) {
          file.selected = false;
        }
      });
      me.files[index].selected = true;
      me.path = file.path;
    },
    goBack() {
      let currDir = this.currDir;
      if (currDir === '/') {
        return;
      }

      currDir = currDir.split('/').filter(Boolean);
      currDir.pop();
      currDir.unshift('');
      currDir.push('');
      currDir = currDir.join('/');
      this.listFile(currDir);
      this.currDir = currDir;
      this.path = '';
    },
    confirm() {
      this.$emit('input', this.path);
      this.dialogVisible = false;
    },
    handleClose() {
      this.files = [];
      this.path = '';
    }
  }
};
</script>

<style>
.tree-view {
  width: 100%;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
  cursor: pointer;
  padding-left: 20px;
}

.item.selected {
  background-color: aliceblue;
}

.card-text {
  height: 300px;
  width: 500px;
  overflow-x: hidden;
  overflow-y: auto;
}

.curr-path {
  font-size: 13px;
  font-weight: normal;
}
</style>

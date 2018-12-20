
<template>
  <div  class="file-item" v-if="item">
   <div v-if="item.type=='folder'">
      <v-icon class="orange--text mt-1" size="45px">fa-folder</v-icon>
      <div class="truncate">{{item.name}}</div>
   </div>
   <div v-if="item.type=='file'">
      <v-icon class="mt-1" size="45px">fa-file-o</v-icon>
      <div class="truncate">{{item.name}}</div>
   </div>
 </div>
 </template>

<script>

export default {
  props: ['item'],
  data: ()=>({

  }),
  mounted(){

  }
}
</script>

<style>
.object-item{
  float:left;
  margin:8px;
  height:54px;
  width:220px;
  border:2px solid #ddd;
}
.object-item i{
  margin:6px 4px;
  font-size:36px;
}
.object-item:hover{
  border-color: #999;
}
.sel-item.object-item{
  border-color: #66aaff;
  box-shadow: 0 0 10px #007bff;
}


.file-item {
  width: 100px;
  height: 80px;
  float: left;
  text-align: center;
  border: 1px solid #eee;
  cursor: pointer;
  margin: 8px;
  font-size:12px;
}

.file-item:hover {
  border-color: #ccc;
}
.file-item.sel-item {
  box-shadow: 0 0 10px #007bff;
}

</style>

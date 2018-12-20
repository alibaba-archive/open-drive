<template>
    <v-navigation-drawer fixed mobile-break-point="960" :clipped="true"
  style="padding: 32px 24px;" v-model="drawer" app>
    文档
    <ul id="demo">
      <Tree v-for="(obj, index) in treeData" :key="index" :model="obj">
      </Tree>
    </ul>
  </v-navigation-drawer>
</template>


<script>
import Doc from '@/services/docs.js' 
import mermaid from 'mermaid'
import Tree from '../_/Tree'

export default {
  components : {
      Tree 
  },
  data() {
    return { 
      drawer: true,
      treeData: []
    }
  }, 
  mounted() {
    this.init();
  
    this.$root.$on('toggle::SideBar',(v)=>{
       if (v == null) this.drawer = !this.drawer
        else this.drawer = !!v;
    })

  }, 
  methods: {
    init() { 
      this.loadTree();
    }, 
    async loadTree() {
      var menu = await Doc.loadMenu('/docs/index.json')
      this.treeData = menu;
    }
  }
}
</script>

<style scoped>
@media (max-width:568px){
  #md-render{
    margin:0px
  }
}
 #md-render{
   margin:0 30px
}

.mn-list {
  position: fixed;
  left: 0;
  top: 50%;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
}
</style>
<style>

.markdown-body{
  background: white;
  position: relative;
}
.markdown-body pre{
  background: #eee;
  border: 1px solid #ccc; 
}
.markdown-body code{
  box-shadow: none;
  -webkit-box-shadow: none;
  background: transparent;
}

.markdown-body code:after,
.markdown-body code:before,
.markdown-body kbd:after,
.markdown-body kbd:before {
  content: "";
  letter-spacing: -1px;
}

.markdown-body table{
  display: table !important;  
  width: 100%;
  overflow: auto; 
}
.markdown-body table th, .markdown-body table td{
  word-break: break-all;
}
 
#md-snav-card{
  word-break: break-all;
  position:fixed;
  top:70px;
  overflow:auto;
  max-height:80%;
  max-width:90%;
  
}
#md-snav{
  font-size:12px;
}
#md-snav>ul{
  list-style-type: none;
  padding-left:0
}

a.mar_a.scroll-link-on{
  color:blue;
  font-weight: bold;
  text-shadow: 2px 2px 2px rgba(0,0,0,0.3);
}
.bc-tree-item:before{
  content: '*';
  color: red;
  text-shadow: 0 2px 2px rgba(0,0,0, 0.54);
}
</style>

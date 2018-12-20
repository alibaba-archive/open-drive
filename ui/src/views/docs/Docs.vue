<template>
<div>
  <div class="markdown-body">
    <div class="mn-list" v-if="$vuetify.breakpoint.smAndDown" @click="drawer = !drawer">
      <v-icon>keyboard_arrow_right</v-icon>
    </div>
    <v-container fluid grid-list-xm class="pa-0">
    <v-layout wrap row>
      <v-flex md10>
        <div id="md-render"></div>
      </v-flex>
      <v-flex md2 class="hidden-sm-and-down">
      <v-card id="md-snav-card">
          <v-card-text id="md-snav"></v-card-text>
      </v-card>
      </v-flex>
    </v-layout>
  </v-container>
  </div>

</div>
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
      docPath: '',  
    }
  },
  // watch: {
  //   '$route.path' () {
  //     this.init()
  //   }
  // },
  mounted() {
    this.init();
 
    $(document).scroll(function(){
  
      $('a.mar_a').removeClass('scroll-link-on')
      var docScrTop = $(document).scrollTop();
      var arr = $('div.mar_ids');
      var lastId = 'id-0';
      for(let item of arr){
        let ele = $(item);
        if(docScrTop+2 < ele.offset().top){
          $('a.mar_a[mar_id="'+lastId+'"]').addClass('scroll-link-on')
          break;
        }
        lastId = ele.attr('id');
      }
    }); 

  },
  destroyed(){
    $(document).unbind('scroll')
  },
  methods: {
    init() {
      this.docPath = this.$route.params.docPath || 'quickstart/guide';

      this.docUrl = `/docs/${this.docPath}.md`;
      this.docPre = this.docUrl.substring(0, this.docUrl.lastIndexOf('/'))
 
      this.loadMD();
    },
    async loadMD() {
      var html = await Doc.loadMD(this.docUrl);

      $('#md-render').html(html);

      $('#md-render img').each((i, n) => {
        var src = $(n).attr('src');
        if (!src.startsWith('http')) {
          $(n).attr('src', this.docPre + "/" + src).css({
            'max-width': '100%'
          });
        }
      });
 

      $('#md-render a[href]').each(function(i,n){
        var href= $(n).attr('href')
        if(href.startsWith('http')){
          $(n).attr('target', '_blank')
        }
      });

      mermaid.init({
        noteMargin: 10
      }, ".mermaid");


      var snav_arr= [];
      var that=this;
      var c=0;
      $('#md-render h1,h2,h3').each(function(i, n) {
        var txt = $(this).text();
        var id = '/docs/'+encodeURIComponent(that.docPath) + '?pos=' +  "id-"+c;
        c++;

        $(this).before(`<div class="mar_ids" id="${id}" style="transform:translateY(-60px)"></div>`);

        snav_arr.push(`<li><a class="mar_a" ${$(n)[0].tagName!='H3'?'style="font-weight:bold"':''} mar_id="${id}" href="#${id}">${txt}</a></li>`)
      });
      $('#md-snav').html( '<ul>'+ (snav_arr.join(''))+'</ul>');


      //a href pos
      if(this.$route.query.pos){
        var posId = '/docs/'+encodeURIComponent(this.docPath) + '?pos=' + encodeURIComponent(this.$route.query.pos);
        var ele = $(document.getElementById(posId))

        await delay(100)
        $(document).scrollTop(ele.offset().top)
      }else{
        $(document).scrollTop(0)
      }
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
   margin:0 30px;
   position: relative;
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

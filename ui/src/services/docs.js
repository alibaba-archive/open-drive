import $ from 'jquery'

//markdown
import markdownIt from 'markdown-it'
import markdownItMermaid from 'markdown-it-mermaid'
import markdownItHighlight from 'markdown-it-highlight'

const mdi = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

mdi.use(markdownItHighlight)
mdi.use(markdownItMermaid)


export default {
  loadMD,
  loadMenu
}

async function loadMD(url){
  var str;
  try{
     str = await $.get(url,{r: getSessionRandom()});
  }catch(e){
     str = "Not found"
  }
  var html = mdi.render(str);
  return html;
}

async function loadMenu(url){ 
   return await $.get(url,{r: getSessionRandom()});
}

function getSessionRandom(){
  var v=sessionStorage.getItem('random');
  if(!v){
    v=Math.random();
    sessionStorage.setItem('random', v);
  }
  return v;
}

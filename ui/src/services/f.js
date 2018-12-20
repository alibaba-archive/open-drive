
export default {
  userType,
  // userRole,
  timeFormat,
  fromNow,
  leftTime,
  parseOssPath,
  privilegeFormat,
  storeType,
  jobStatusFormat,
  sizeFormat,
  statusColor,
  sub,
  hideSecret
}


function hideSecret(s){
  if(!s || s.length<6)return '*****';
  return s?s.substring(0,3)+'***'+s.substring(s.length-3):"***";
}

function sub(s, len){
  if(!s)return s;
  return s.length>len?s.substring(0,len)+'...':s
}
function jobStatusFormat(s, cls){
  if(!s)return s
  switch(s.toLowerCase()){
    default:
    case 'waiting': return cls?'grey':'等待中';
    case 'running': return cls?'info':'正在运行';
    case 'stopped': return cls?'orange':'已停止';
    case 'finished': return cls?'success':'完成';
    case 'failed': return cls?'error':'失败';
  }
}
function statusColor(s){
  if(!s)return ''
  switch(s.toLowerCase()){
    default:
    case 'waiting': return 'grey';
    case 'running': return 'primary';
    case 'stopped': return 'orange';
    case 'finished': return 'green';
    case 'failed': return 'red';
  }
}
function sizeFormat(s, len, ex){
  len = len || 1024;
  var arr = ['Byte','K','M','G','T','P'];
  var t=[];
  for(var i=0;i<arr.length;i++){
    if(s < Math.pow(len,i+1)){
      var tmp  = Math.round(s/Math.pow(len,i)*100)/100 + arr[i];
      if(ex) t.push(tmp);
      else return tmp;
    }
  }
  var tmp  = Math.round(s/Math.pow(len,5) *100)/100+ arr[5];
  if(ex) t.push(tmp);
  else return tmp;

  return t.join(' ');
}

function storeType(s){
  return s=='oss'?'OSS':'OTS+OSS';
}

function privilegeFormat(s,cls){
  switch(s){
    default: return s;
    case 'readonly': return cls?'grey':'只读';
    case 'writable': return cls?'green':'读写';
    case 'grantable': return cls?'purple':'读写可授权';
  }
}

function parseOssPath(s){
  var a = s.substring('oss://'.length)
  var ind = a.indexOf('/');
  if(ind>0){
    var bucket = a.substring(0, ind)
    var key = a.substring(ind+1)
    return {bucket, key}
  }else{
    return {bucket: a}
  }
}

function fromNow(s){
  return moment(s).fromNow()
}
function timeFormat(s, otherwise='-'){
  var d = new Date(s)
  if(d=='Invalid Date')return otherwise
  return moment(s).format('YYYY-MM-DD HH:mm:ss')
}
// function userRole(userInfo){
//   if(userInfo.is_admin){
//     return '管理员('+privilegeFormat(userInfo.privilege)+')'
//   }else{
//     return '普通用户'
//   }
// }

function userType(s){
  switch(s){
    case 'dingding': return '钉钉用户';
    case 'alipay': return '支付宝用户';
    default: return s;
  }
}

function leftTime(ms){
 if(isNaN(ms)){
   return '';
 }
 if(ms<=0)return 0;
 else if(ms < 1000) return ms+'ms';

 //return moment.duration(ms).humanize();
 var t=[];

 var d = Math.floor(ms/24/3600/1000);
 if(d){
   ms = ms-d*3600*1000*24;
   t.push(d+'D');
 }
 var h = Math.floor(ms/3600/1000);
 if(h){
   ms = ms-h*3600*1000;
   t.push(h+'h');
 }
 var m = Math.floor(ms/60/1000);
 if(m){
   ms = ms-m*60*1000;
   t.push(m+'m');
 }
 var s = Math.floor(ms/1000);
 if(s){
   ms = ms-s*1000;
   t.push(s+'s');
 }
 //
 //if(ms){
 //  t.push(ms+'ms');
 //}
 return t.join(' ');
}

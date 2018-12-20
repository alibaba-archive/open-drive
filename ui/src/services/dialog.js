
export default {
  alert,
  confirm,
  show,
  warn
}
function show(opt){
  MyApp.$emit('add::Dialog',opt)
}
function alert(title, message, callback,isModal){
   return _dialog('alert',title,message, callback,isModal)
}
function confirm(title, message, callback, isModal){
   return _dialog('confirm',title,message, callback, isModal)
}
function warn(title, message, callback, isModal){
  return _dialog('warn',title,message, callback, isModal)
}
function _dialog(type, title, message, callback,isModal){
  if(typeof(callback)=='function'){
    MyApp.$emit('add::Dialog',{
      title,message,callback, type,
      persistent: isModal
    });
  }else{
    return new Promise((a,b)=>{
      MyApp.$emit('add::Dialog',{
        title,message,type,
        callback:function(f){
          a(f)
        }
      });
    });
  }
}

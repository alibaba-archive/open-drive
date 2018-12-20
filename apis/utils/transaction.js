module.exports= {
  exec
};

async function exec(actionObjArr) {
  var index, result = [];
  try{
    for(index = 0; index < actionObjArr.length; index ++) {
      let obj = actionObjArr[index];
      if(isFunction(obj.action)){
        result[index] = await obj.action();
      }
    }
  } catch (e) {
    console.error('--transaction.exec Error:', e)
    while (index-- > 0) {
      let obj = actionObjArr[index];
      if (isFunction(obj.restore)) {
        await obj.restore();
      }
    }
    throw e;
  }
  return result;
}

function isFunction(obj) {
  return typeof (obj) == 'function'
  // var str = Object.prototype.toString.apply(obj)
  // return str === "[object Function]" || str === "[object AsyncFunction]";
}

const TableStore = require('tablestore')
// const Long = TableStore.Long;
const debug = require('debug')('ots')

module.exports = {
  // getRow,
  // putRow,
  // updateRow,
  // deleteRow,
  // getRange,
  // batchWriteRow,

  getPKMap,
  getPKMapList,
  getAttrMap,
  // batchGetRow,
  // search
}

const OTS_METHOD = ['search','getRow','putRow','updateRow','deleteRow','batchGetRow','getRange','batchWriteRow']

OTS_METHOD.forEach(mt=>{
  module.exports[mt] = (akInfo, params)=>{
    var client = getClient(akInfo);
    return new Promise((a,b)=> { 
      client[mt](params, function(err, data){
        if(err){
          console.error(`${mt}:${JSON.stringify(params)}-----err:${JSON.stringify(err)}`)
          b(err);
        }
        else{
          debug(`${mt}:${JSON.stringify(params)}-----data:${JSON.stringify(data)}`)
          a(data);
        }
      });
    });
  }
})

//----------------
function getPKMap(arr) {
  if (!arr) return {};
  var m = {};
  arr.forEach(n => {
    m[n.name] = n.value;
  });
  return m;
}
function getPKMapList(arr) {
  if (!arr) return [];
  var t=[];
  arr.forEach(n => {
    var m = {};
    m[n.name] = n.value;
    t.push(m)
  });
  return t;
}
function getAttrMap(arr) {
  if (!arr) return {};
  var m = {};
  arr.forEach(n => {
    m[n.columnName] = n.columnValue;
  });
  return m;
}
//----------------------
function getClient(akInfo){
  var client = new TableStore.Client({
    accessKeyId: akInfo.accessKeyId,
    secretAccessKey: akInfo.accessKeySecret,
    securityToken: akInfo.securityToken,
    endpoint: akInfo.endpoint,
    instancename: akInfo.instancename,
  });
  return client;
}

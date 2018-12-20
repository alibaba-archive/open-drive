const Ots = require('./ots');
const TableStore = require('tablestore');

const E = require('./exceptions.js');

class OtsModel {
  
  constructor(_table, _pks, _attrs, _defaultAttrs, option) {
    this.pks = [];
    this.pkNames = [];
    this.attrs = _attrs || [];
    this.defaultAttrs = _defaultAttrs || {};
    
    if(typeof _table === "string"){
      this.table = _table || "";
    }
    else if(typeof _table === "object"){
      this.table = _table.tableName || "";
      this.index = _table.indexName || "";
    }
    
    option = option || {};
    this.separator_key = option.separator_key || "#";
    this.separator_value = option.separator_value || "#";
    
    if(!this.table || !Array.isArray(_pks) || _pks.length === 0){
      throw new E.Internal("ots table init failed");
    }
    
    // 解析pk， 支持{}, [], "";
    _pks.forEach((pk, index) => {
      /*
       * pk: ["drive", "file"]
       * name: "drive_file"
       */
      if(Object.prototype.toString.apply(pk) === "[object Object]") {
        this.pks.push(pk.pk);
        this.pkNames.push(pk.name);
      }
      else if(Object.prototype.toString.apply(pk) === "[object String]"){
        this.pks.push(pk);
        this.pkNames.push(pk);
      }
      else if(Object.prototype.toString.apply(pk) === "[object Array]"){
        this.pks.push(pk);
        this.pkNames.push(pk.join(this.separator_key));
      }
    });
  
  }
  
  async get(akInfo, _pks){
    var pk = this.formatPks(this.pks, _pks);
    var result = await Ots.getRow(akInfo, {
      tableName: this.table,
      primaryKey: pk
    });
  
    return this.formatGetResult(result.row);
  }
  
  async list(akInfo, _pks, opt = {
    marker: undefined,
    limit: undefined,
    break_pk: undefined
  }) {
    var start_pk = [], end_pk = [], marker = null;

    if (opt.marker) {
      marker = this.decodeListMarker(opt.marker);
    }
    
    var endType = 0;  // 判断pk结尾
    
    for(let i = 0; i < this.pks.length; i ++) {
      let pk = this.pks[i];
      let pkName = this.pkNames[i];
      let startObj = {}, endObj = {}, pkValues = [];
      // pk有Array和string两种
      if(Array.isArray(pk)) {
        // 提取pk的value
        pkValues = pk.map((item) => {
          // 按顺序搜寻，如果有undefined或者break_pk则作为结尾。
          if(item == opt.break_pk){
            endType = 1;
            return _pks[item];
          }
          if(_pks[item] === undefined) {
            endType = 1;
            return "";
          }
          return _pks[item];
        });
        // 如果已搜寻到结尾
        if(endType === 1) {
          if(marker && marker[pkName]){
            startObj[pkName] = marker[pkName];
          }
          else{
            startObj[pkName] = pkValues.filter(a => a != "").join(this.separator_value);
          }
          endObj[pkName] = pkValues.filter(a => a != "").join(this.separator_value) + "\uFFFF";
          start_pk.push(startObj);
          end_pk.push(endObj);
        }
        else{
          if(marker && marker[pkName]){
            startObj[pkName] = marker[pkName];
          }
          else{
            startObj[pkName] = pkValues.join(this.separator_value);
          }
          endObj[pkName] = pkValues.join(this.separator_value);
        }
      }
      else{
        if(opt.break_pk !== undefined && pk == opt.break_pk){
          endType = 2;
          if(marker && marker[pkName]){
            startObj[pkName] = marker[pkName];
          }
          else{
            startObj[pkName] = _pks[pk];
          }
          endObj[pkName] = _pks[pk] + "\uFFFF";
          start_pk.push(startObj);
          end_pk.push(endObj);
        }
        else{
          if(_pks[pk] === undefined){
            endType = 2;
            if(marker && marker[pkName]){
              startObj[pkName] = marker[pkName];
            }
            else{
              startObj[pkName] = TableStore.INF_MIN;
            }
            endObj[pkName] = TableStore.INF_MAX;
            start_pk.push(startObj);
            end_pk.push(endObj);
          }
          else{
            if(marker && marker[pkName]){
              startObj[pkName] = marker[pkName];
            }
            else{
              startObj[pkName] = _pks[pk];
            }
            endObj[pkName] = _pks[pk];
          }
        }
      }
      if(endType === 0) {
        start_pk.push(startObj);
        end_pk.push(endObj);
      }
    }

    var options = {
      tableName: this.table,
      direction: TableStore.Direction.FORWARD,
      inclusiveStartPrimaryKey: start_pk,
      exclusiveEndPrimaryKey: end_pk,
      limit: opt.limit || 100
    };
    
    var result = await Ots.getRange(akInfo, options);

    return {
      items: this.formartListResult(result),
      next_marker: this.encodeListMarker(result.next_start_primary_key)
    };
  }
  
  async del(akInfo, _pks){
    var pk = this.formatPks(this.pks, _pks);

    var result = await Ots.deleteRow(akInfo, {
      tableName: this.table,
      primaryKey: pk,
      condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
    });
    
    return result;
  }
  
  async add(akInfo, _pks, _attrs){
    var info = await this.get(akInfo, _pks);
    if(info){
      throw new E.AlreadyExists("Already exists");
    }
    return await this.put(akInfo, _pks, _attrs);
  }
  
  async put(akInfo, _pks, _attrs){
    var pk = this.formatPks(this.pks, _pks);

    var attributeColumns = this.formatParams(this.attrs, _attrs, this.defaultAttrs);

    var result = await Ots.putRow(akInfo, {
      tableName: this.table,
      condition: new TableStore.Condition(TableStore.RowExistenceExpectation
        .IGNORE, null),
      primaryKey: pk,
      attributeColumns: attributeColumns,
      returnContent: {
        returnType: TableStore.ReturnType.Primarykey
      }
    });
    
    return result;
  }
  
  async update(akInfo, _pks, _attrs, _condition) {
    var pk = this.formatPks(this.pks, _pks), 
        result = null,  // 执行结果
        condition = new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),  // 条件
        attributeColumns = this.formatParams(undefined, _attrs, this.defaultAttrs); // update的属性
    
    // 如果有条件，则需要检查条件是否成立
    if(_condition && _condition.attr && _condition.value) {
      condition = new TableStore.Condition(TableStore.RowExistenceExpectation.EXPECT_EXIST,
        new TableStore.SingleColumnCondition(_condition.attr, _condition.value,
          TableStore.ComparatorType.EQUAL));
    }
    
    return await Ots.updateRow(akInfo, {
      tableName: this.table,
      condition: condition,
      primaryKey: pk,
      updateOfAttributeColumns: [{
        'PUT': attributeColumns
      }]
    });
  }
  
  async batchGet(akInfo, _pksArr) {
    var rows = [];

    _pksArr.forEach((_pks) => {
      var pk = this.formatPks(this.pks, _pks);
      rows.push(pk);
    });

    var result = await Ots.batchGetRow(akInfo, {
      tables:[{
        tableName: this.table,
        primaryKey: rows
      }]
    });

    var t=[]
    result.tables[0].forEach((row) => {
      if (!row.attributes) {
        return false;
      }
      t.push(this.formatGetResult(row))
    });

    return {items: t};

  }
  
  async search(akInfo, attrs, opt = {}) {
    var arr = Object.keys(attrs);
    var searchResult = await Ots.search(akInfo, {
      tableName: this.table,
      indexName: this.index,
      searchQuery: {
        offset: opt.marker || 0,
        limit: opt.limit || 100,
        query: {
          queryType: TableStore.QueryType.TERM_QUERY,
          query: {
            fieldName: arr[0],
            term: attrs[arr[0]]
          }
        }
      },
      columnToGet: {
        returnType: TableStore.ColumnReturnType.RETURN_NONE,
      }
    });
    var pkArr =  this.formartListResult(searchResult);
    var result = await this.batchGet(akInfo, pkArr);
    return {
      items: result.items,
      next_marker: searchResult.next_marker === undefined ? null : searchResult.next_marker
    }
  }
  
  // async batchDel(akInfo, _pksArr) {
  //   var rows = [];
  // 
  //   _pksArr.forEach((_pks) => {
  //     var pk = this.formatPks(this.pks, _pks);
  //     rows.push(pk);
  //   });
  // 
  //   var result = await Ots.batchGetRow(akInfo, {
  //     tables:[{
  //       tableName: this.table,
  //       primaryKey: rows
  //     }]
  //   });
  // 
  //   return result.tables[0].map((row) => {
  //     return this.formatGetResult(row);
  //   });
  // 
  // }
  // 
  formatParams (keys, optionObj, defaultObj) {
    
    // 将传入的各种类型值转换成字符串存入OTS
    
    // TODO: 
    var arr = [];
    if(keys && keys.length > 0){
      keys.forEach((item) => {
        let obj = {};
        if(typeof optionObj[item] === "undefined") {
          obj[item] = defaultObj[item];
        }
        else {
          obj[item] = optionObj[item];
        }
        if(typeof obj[item] !== "undefined"){
          arr.push(obj)
        }
      });
    }
    else if(optionObj){
      for(var k in optionObj){
        let obj = {}
        obj[k] = optionObj[k];
        if(typeof obj[k] !== "undefined"){
          arr.push(obj)
        }
      }
    }
    return arr;
  }
  
  formatPks(pks, optionObj) {
    var arr = pks.map((pk, index) => {
      let obj = {}, pkValues = [];
      if(Array.isArray(pk)){
        pkValues = pk.map((item) => {
          return optionObj[item];
        });
        obj[this.pkNames[index]] = pkValues.join(this.separator_value);
      }
      else{
        obj[this.pkNames[index]] = optionObj[pk];
      }
      return obj;
    });
    return arr;
  }
  
  formatGetResult(row) {
    //fix empty
    if(!row || isEmpty(row)) return null;

    var item = Ots.getAttrMap(row.attributes);
    
    this.pks.forEach((pk, index) => {
      if(Array.isArray(pk)){
        let pkValues = row.primaryKey[index].value.split(this.separator_value);
        pk.forEach((k, i) => {
          item[k] = pkValues[i];
        });
      }
      else{
        item[pk] = row.primaryKey[index].value;
      }
    });
    
    // 将字符串转换成对应类型
    
    // TODO: 

    return Object.keys(item).length > 0 ? item : null;
  }
  
  formartListResult(result) {
    var rows = result.rows || [];
    
    return rows.map(row => {
      return this.formatGetResult(row);
    });
  }
  
  encodeListMarker(next_marker) {
    var _marker = null;
    if (next_marker) {
      let markerPks = next_marker || [];
      _marker = {};
      markerPks.forEach(n => {
        _marker[n.name] = n.value;
      });
      _marker = Buffer.from(JSON.stringify(_marker)).toString('base64');
    }
    return _marker;
  }
  
  decodeListMarker(marker) {
    try {
      return JSON.parse(Buffer.from(marker,'base64').toString());
    } catch (e) {}
    return null;
  }

}

function isEmpty(s){
  for(var k in s) return false;
  return true
}

module.exports = OtsModel;
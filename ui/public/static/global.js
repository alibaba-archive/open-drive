
var endpoint = location.protocol+'//'+location.host+'/api'  // 'http://localhost:3000/api';

var Global={
  
  //网站名称
  title: 'Open Drive',
 
  //网站 logo
  logo: '/static/logo.png',
  
  available_regions: [{"text":"华东1(杭州)","value":"oss-cn-hangzhou"},{"text":"华东2(上海)","value":"oss-cn-shanghai"},{"text":"华北1(青岛)","value":"oss-cn-qingdao"},{"text":"华北2(北京)","value":"oss-cn-beijing"},{"text":"华北3(张家口)","value":"oss-cn-zhangjiakou"},{"text":"华北5(呼和浩特)","value":"oss-cn-huhehaote"},{"text":"华南1(深圳)","value":"oss-cn-shenzhen"},{"text":"香港","value":"oss-cn-hongkong"},{"text":"亚太东南1(新加坡)","value":"oss-ap-southeast-1"},{"text":"亚太东南2(悉尼)","value":"oss-ap-southeast-2"},{"text":"亚太东南3(吉隆坡)","value":"oss-ap-southeast-3"},{"text":"亚太东南5(雅加达)","value":"oss-ap-southeast-5"},{"text":"亚太东北1(东京)","value":"oss-ap-northeast-1"},{"text":"亚太南部(孟买)","value":"oss-ap-south-1"},{"text":"美国西部1(硅谷)","value":"oss-us-west-1"},{"text":"美国东部1(弗吉尼亚)","value":"oss-us-east-1"},{"text":"欧洲中部1(法兰克福)","value":"oss-eu-central-1"},{"text":"中东东部1(迪拜)","value":"oss-me-east-1"},{"text":"英国（伦敦）","value":"oss-eu-west-1"}],
 
  //调用 API 的 client_id
  client_id: 'aliyun',
 
  // 后端 API endpoint, 本地调试请用: http://localhost:3000
  endpoint: endpoint,
 
};

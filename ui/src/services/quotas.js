
import http from './http'

export default {
  get
}
async function get(){
  var xhr = $.ajax({
    method: 'GET',
    url: `${Global.endpoint}/quotas`
  })
  xhr.ignoreError = true;
  return xhr;
}
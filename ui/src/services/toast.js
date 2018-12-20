

var toast = {
  info: init('info'),
  success: init('success'),
  primary: init('primary'),
  secondary: init('secondary'),
  warn: init('warning'),
  warning: init('warning'),
  error: init('error')
};

function init(type){
  return function (message, ttl){
    MyApp.$emit('toast', {
      message, type,  ttl
    });
  }
}

export default toast

export default {
  getValue,
  setValue,
  removeValue
}

function getValue(key, defaultValue) {
  let value = localStorage.getItem(key);
  if(value == null){
    return defaultValue;
  }
  return value;
}

function setValue(key, value) {
  localStorage.setItem(key, value);
}

function removeValue(key) {
  localStorage.removeItem(key);
}

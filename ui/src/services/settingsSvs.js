import localStoreService from './localStoreService'

class SettingItem {

  constructor(_key, _defaultValue, _type) {
    this.key = _key;
    this.defaultValue = _defaultValue;
  }

  get() {
    return localStoreService.getValue(this.key, this.defaultValue);
  }

  set(value) {
    localStoreService.setValue(this.key, value);
  }
}

const maxUploadJobCount = new SettingItem("maxUploadJobCount", "3");
const maxDownloadJobCount = new SettingItem("maxDownloadJobCount", "3");


export default {
  maxUploadJobCount,
  maxDownloadJobCount
}

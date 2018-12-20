# Open drive

Awesome data dispatcher system, cloud drive system.

Base on Alicloud OSS + TableStore.

Power by koa2(node.js).

## 1. Usage

### (1) Requirement

 [Node.js](http://nodejs.cn/download/) >= 8.0 is required.

### (2) Installation
```
npm i -g @alicloud/open-drive
```
### (3) configure file

create a config file: `./config.js`, see [conf/index.js](conf/index.js) for sample.

fill the nessary fields in `./config.js`. Follow [this steps](Deploy.md)

### (4) Start server

```
opendrive -c ./config.js

# Or start like this (After you move ./config.js to ~/.open-drive-config.js)
opendrive serve
```

Open http://localhost:3000 in browser.

* Note: First login user will be set as SuperAdmin.


```
opendrive -h  # for more
```

## 2. Multi node deployment

### (1) Use multi-processing mode in enterprise scene
```
opendrive -m  # multi-processing mode (in one node) 
```

### (2) Deploy on more than one machine

* Note: You have to copy `rsa-key.js` to every node, make sure they are the same keys.



## 3. Dev Environment Requirement

### (1) clone source code
```
git clone git@github.com:aliyun/open-drive.git

cd open-drive
npm i          # install dependent modules
cd ui && npm i
```

### (2) configure file

`cp conf/index.js ~/.open-drive-config.js`

then fill the nessary fields in `.open-drive-config.js` file

### (3) start server

start server in dev mode
```
npm run dev
```

### (4) build dist

```
npm run build
```

### (5) what's next

See [DEV.md](DEV.md) for more.


## 4. LICENSE

THE MIT LICENSE

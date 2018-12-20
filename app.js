const Koa = require('koa')
const app = new Koa()
// const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

process.env.RUNNER='koa'
global.isDev = (process.env.NODE_ENV=='development')

const index = require('./apis')

// error handler
// onerror(app)

//error 
app.use(async (ctx,next)=>{
  try{
    await next()
  }catch(e){
    
    e = typeof e =='string'? JSON.parse(e): e;

    if(isDev){ 
      console.log(e.stack)
      ctx.status = e.status||500;
      ctx.body = {
        code: e.code||'Internal',
        message: e.message || e
      }
    }else{ 
      console.error(e.status?e.code+':'+e.message:e.stack)
      ctx.status = e.status||500;
      ctx.body = {
        code: e.code||'Internal',
        message: e.message || e
      }
    }
  }
})

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

app.use(json())
isDev? app.use(logger()): null
app.use(require('koa-static')(__dirname + '/dist'))

// app.use(views(__dirname + '/views', {
//   extension: 'ejs'
// }))


// methods
app.use(async (ctx, next) => {

  ctx.set("Access-Control-Allow-Headers", "X-Requested-With,X-Sequence,X-Ca-Key,X-Ca-Secret,X-Ca-Version,X-Ca-Timestamp,X-Ca-Nonce,X-Ca-API-Key,X-Ca-Stage,X-Ca-Client-DeviceId,X-Ca-Client-AppId,X-Ca-Signature,X-Ca-Signature-Headers,X-Ca-Signature-Method,X-Forwarded-For,X-Ca-Date,X-Ca-Request-Mode,Authorization,Content-Type,Accept,Accept-Ranges,Cache-Control,Range,Content-MD5");
  ctx.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,HEAD,OPTIONS,PATCH");
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Max-Age", "172800");


  if(ctx.method=='OPTIONS'){
    ctx.status=200;
    return;
  }

  await next()
})

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


// routes
app.use(index.routes(), index.allowedMethods())


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app

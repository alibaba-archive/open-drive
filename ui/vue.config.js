var webpack = require('webpack') 

var plugins = [
    new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery"
    })
]
 


module.exports = {
    // 基本路径
    baseUrl: '/',
    // 输出文件目录
    outputDir: '../dist',

    devServer: {
        open: process.platform === 'darwin',
        host: '0.0.0.0',
        port: 8080,
 
        proxy: {
            "/api": {
                target: "http://localhost:3000", 
                changeOrigin: true,
                pathRewrite: {
                   '^/api': '/api'   //需要rewrite重写的,
                }       
            } 
        } 
    },
    configureWebpack: {
        plugins
    }
}
var path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const WebpackNotifierPlugin = require('webpack-notifier')

module.exports = merge(common, {
    mode: 'development',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'static', 'bundles')
    },
    plugins: [
        new WebpackNotifierPlugin()
    ],

    devtool: 'inline-source-map'
})

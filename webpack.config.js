const path = require('path')
const WebpackNotifierPlugin = require('webpack-notifier')

module.exports = {
    entry: './static/js/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'static', 'bundles')
    },
    mode: 'development',

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['babel-preset-es2017']
                }
            }
        }, {
            test: /\.less$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "less-loader" // compiles Less to CSS
            }]
        }, {
            enforce: 'pre',
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'eslint-loader'
        }]
    },

    resolve: {
        extensions: ['.less', '.js'],
        modules: [path.resolve(__dirname, 'static', 'js'), 'node_modules']
    },

    plugins: [
        new WebpackNotifierPlugin()
    ],

    devtool: 'inline-source-map'
}

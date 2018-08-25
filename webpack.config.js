const path = require('path')

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
            exclude: /(node_modules|bower_components)/,
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
        }]
    },

    resolve: {
        extensions: ['.less', '.js'],
        modules: [path.resolve(__dirname, 'static', 'js'), 'node_modules']
    },

    devtool: 'inline-source-map'
}

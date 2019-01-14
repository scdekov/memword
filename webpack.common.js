const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')

module.exports = {
    entry: './static/js/index.js',

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['babel-preset-es2017'],
                    plugins: ['babel-plugin-transform-class-properties']
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
        new BundleTracker({filename: './webpack-stats.json'})
    ]
}

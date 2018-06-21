const path = require("path");
const webpack = require("webpack");

const getPlugins = (env = {}) => [
    new webpack.DefinePlugin({
        "process.env": {
            NODE_ENV: JSON.stringify(env.NODE_ENV || "development")
        }
    }),
    new webpack.HashedModuleIdsPlugin(),
];

module.exports = {
    resolve: {
        alias: {
            imc: path.resolve(__dirname, './'),
            pixelmatch: path.resolve(__dirname, "./node_modules/dynamicpixelmatch"),
        },
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: getPlugins(),
    module: {
        rules: [],
    },
    entry: {
        index: "./index.js",
    },
    node: {
        fs: 'empty' ,
        child_process: 'empty' ,
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    },
};

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
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: getPlugins(),
    module: {
        rules: [],
    },
    entry: {
        index: "./src/index.js",
    },
    target: 'node',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        libraryTarget: 'commonjs',
    },
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = () => {
    return {
        target: 'web',
        entry: './src/app.ts',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
        },
        plugins: [
            new HtmlWebpackPlugin({ template: 'public/index.html' }),
            new MiniCssExtractPlugin({
                filename : isDevelopment ? '[name].css' : '[name].[hash].css'
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.module\.s[ac]ss$/,
                    use: [
                        {
                            loader: 'css-loader',
                            options: {  modules: true }
                        },
                        'sass-loader',
                    ],
                },
                {
                    test: /\.s[ac]ss$/,
                    exclude: /\.module\.s[ac]ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                    ],
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
            }
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            compress: true,
            https: false,
            port: 3000,
        },
        devtool: 'inline-source-map',
    }
};
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const createPage = (pagePath, chunks = [], template = "./pages/templates/index.html") =>
    new HtmlWebpackPlugin({
        inject: 'body',
        chunks: chunks,
        template: template,
        filename: pagePath + '.html',
        publicPath: '/',
        favicon: './assets/img/favicon.ico',
        minify: {
            minifyCSS: true,
            minifyJS: true,
            removeComments: true,
            collapseWhitespace: true
        }
    })

module.exports = (_, mode) =>
{
    const isProduction = (typeof mode.env.production === "boolean" && mode.env.production);
    const generateProfile = (typeof mode.env.generateprofile === "boolean" && mode.env.generateprofile);

    return {
        entry: {
            main: "./pages/index/index.ts"
        },
        mode: isProduction ? "production" : "development",
        output: {
            filename: '[name].js',
            chunkFilename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist')
        },
        resolve: {
            extensions: [ ".js", ".ts" ]
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpe?g|gif|svg|webp)$/i,
                    use: 'file-loader'
                },
                {
                    test: /\.ts$/,
                    loader: "ts-loader"
                },
                {
                    test: /\.css$/i,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader
                        },
                        'css-loader'
                    ]
                }
            ]
        },
        devServer: {
            contentBase: "./dist",
            port: 90,
            host: '0.0.0.0'
        },
        plugins: [
            ...(generateProfile ? [ new BundleAnalyzerPlugin() ] : []),
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css'
            }),
            createPage('index', [ 'main' ]),
            createPage('/p/terms', [], "./pages/templates/terms.html"),
            createPage('/p/privacy', [], "./pages/templates/privacy.html"),
            createPage('/p/imprint', [], "./pages/templates/imprint.html"),
        ],
        optimization: isProduction ? {
            minimize: true,
            minimizer: [ new TerserPlugin(), new CssMinimizerPlugin() ],
            splitChunks: {
                chunks: 'async',
                maxAsyncRequests: 30,
                maxInitialRequests: 30
            }
        } : undefined
    }
};
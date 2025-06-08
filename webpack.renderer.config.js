const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

// ADD this:
const isDev = process.env.NODE_ENV !== "production";

module.exports = {
  mode: isDev ? "development" : "production", // FIXED!
  target: "web",
  devtool: isDev ? "eval-source-map" : "source-map",
  entry: "./src/renderer/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist/renderer"),
    filename: "[name].[contenthash].js",
    publicPath: "./", // CAREFUL: for production!
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.json$/,
        type: "json",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    fallback: {
      global: require.resolve("global/"),
      path: require.resolve("path-browserify"),
      fs: false,
      crypto: false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/renderer/index.html",
      filename: "index.html",
      inject: true,
      minify: !isDev, // Minify HTML only for production
      hash: true,
      scriptLoading: "defer",
      meta: {
        viewport: "width=device-width, initial-scale=1",
      },
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new webpack.ProvidePlugin({
      global: require.resolve("global/"),
    }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
      "process.platform": JSON.stringify(process.platform),
      "process.arch": JSON.stringify(process.arch),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist/renderer"),
    },
    port: 3000,
    hot: true,
    open: false,
    historyApiFallback: true,
  },
};

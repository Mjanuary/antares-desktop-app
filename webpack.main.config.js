const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  target: "electron-main",
  entry: "./src/main/index.ts",
  output: {
    path: path.join(__dirname, "dist/main"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: {
    sqlite3: "commonjs sqlite3",
    "better-sqlite3": "commonjs better-sqlite3",
  },
  node: {
    global: true,
    __dirname: false,
    __filename: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "src/splash.html",
          to: path.join(__dirname, "dist/main/splash.html"),
        },
        {
          from: "src/splash.html",
          to: path.join(__dirname, "dist/splash.html"),
        },
      ],
    }),
  ],
};

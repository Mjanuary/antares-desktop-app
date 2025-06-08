const path = require("path");

module.exports = {
  mode: "development",
  target: "electron-preload",
  entry: "./src/preload/index.ts",
  output: {
    path: path.join(__dirname, "dist/preload"),
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
  node: {
    global: true,
    __dirname: false,
    __filename: false,
  },
};

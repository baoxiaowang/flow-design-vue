const path = require("path");
const resolve = dir => path.join(__dirname, dir);
module.exports = {
  chainWebpack: config => {
    config.resolve.alias // 添加别名
      .set("@", resolve("src"))
      .set("src", resolve("src"));
  }
};

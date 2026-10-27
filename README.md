# AO3 Exact Title Search

一个 AO3 标题连续匹配搜索项目。

- `extension/`：保留 AO3 原生界面，只在后台把顶部搜索改成标题连续精确匹配。
- `docs/`：GitHub Pages 静态公开入口，将精确标题查询发送到 AO3。
- `public/` + `server.mjs`：本地镜像版本，在自定义页面中读取和展示 AO3 搜索结果。

## Browser extension

扩展不会添加搜索面板。安装后继续使用 AO3 原本的顶部搜索框即可。扩展清单没有声明账号、存储、浏览历史或跨站权限；内容脚本的匹配范围是 `https://archiveofourown.org/*`。

## 公开版本

GitHub Pages 版本提交搜索后会前往 AO3 的作品标题搜索结果页。

## 启动

需要 Node.js 18 或更新版本。在本文件夹打开终端并运行：

```bash
npm start
```

然后在浏览器打开：

```text
http://127.0.0.1:4173
```

不需要安装依赖。

## 工作方式

页面把搜索文字作为 AO3 的标题短语查询，再对返回的作品标题进行连续字符串校验。

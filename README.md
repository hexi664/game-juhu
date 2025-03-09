# Game Hub - HTML5游戏聚合网站

这是一个HTML5游戏聚合网站，收集了各种有趣的在线游戏，包括自制游戏和第三方游戏。

## 项目结构

```
/
├── index.html          # 主页
├── games/              # 游戏文件夹
│   ├── plane-battle/   # 飞机大战游戏
│   └── snakes/         # 贪吃蛇游戏
├── game-monster/       # 甄开心小镇疑云游戏
├── vercel.json         # Vercel配置
├── _headers            # Cloudflare Pages安全头配置
└── _redirects          # Cloudflare Pages重定向配置
```

## 部署指南

### Vercel部署

1. 在Vercel上创建新项目
2. 导入此仓库
3. 使用以下设置:
   - 框架预设: Other
   - 构建命令: (留空)
   - 输出目录: (留空)
4. 点击"Deploy"

### Cloudflare Pages部署

1. 在Cloudflare Pages上创建新项目
2. 导入此仓库
3. 使用以下设置:
   - 构建命令: (留空)
   - 构建输出目录: (留空)
4. 点击"Save and Deploy"

## 本地开发

要在本地运行此项目，只需使用任何静态文件服务器，例如:

```bash
# 使用Python
python -m http.server

# 或使用Node.js的http-server
npx http-server
```

## 注意事项

- 所有游戏资源使用相对路径
- 外部游戏使用HTTPS链接
- 确保所有iframe内容遵循安全策略

## 许可证

MIT 
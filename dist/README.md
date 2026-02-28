# 小小程序员逻辑思维训练器 - 独立部署包

## 📦 文件说明

这是一个**纯前端**的 Web 应用，无需服务器，直接用浏览器打开即可使用。

## 📁 文件结构

```
dist/
├── index.html              # 入口文件，双击即可打开
├── assets/
│   ├── index-xxx.js        # JavaScript 主程序
│   └── index-xxx.css       # 样式文件
└── README.md               # 本说明文件
```

## 🚀 使用方式

### 方式一：直接打开（推荐）
1. 解压 `CreativeCoding-LittleProgrammer.zip`
2. 双击 `dist/index.html` 文件
3. 浏览器会自动打开应用

### 方式二：本地服务器（可选）
如果需要使用本地服务器（某些浏览器安全策略限制），可以使用以下任一方式：

**Python 3:**
```bash
cd dist
python -m http.server 8080
```
然后访问 http://localhost:8080

**Node.js:**
```bash
npx serve dist
```

**VS Code:**
安装 "Live Server" 插件，右键 `index.html` → "Open with Live Server"

## 💾 数据存储

- 所有进度数据保存在浏览器的 **localStorage** 中
- 无需登录，无需联网
- 清除浏览器数据会重置进度

## 🔧 浏览器兼容性

- Chrome / Edge / Firefox / Safari 最新版本
- 支持移动端浏览器（响应式设计）

## 📱 功能特性

✅ 6 个渐进式关卡挑战  
✅ 可视化积木编程  
✅ 重复循环指令支持嵌套  
✅ 实时预览 Python 代码  
✅ 成就系统  
✅ 进度自动保存  

## 📝 操作指南

1. **添加指令**：点击下方积木按钮
2. **编辑重复积木**：点击紫色重复积木进入编辑模式
3. **设置重复次数**：点击重复积木上的数字
4. **运行程序**：点击绿色"▶ 运行程序"按钮
5. **重置**：点击"↺ 重置"清空代码

---

版本：v1.0.0  
更新日期：2026-02-28

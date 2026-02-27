#!/bin/bash
# Trip Splitter - 快速启动脚本

set -e

echo "🚀 Trip Splitter - 快速启动"
echo "=============================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 18+"
    echo "   访问：https://nodejs.org"
    exit 1
fi

echo "✅ Node.js 版本：$(node --version)"

# 进入项目目录
cd "$(dirname "$0")"

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
else
    echo "✅ 依赖已安装"
fi

# 启动开发服务器
echo ""
echo "🌐 启动开发服务器..."
echo "   访问：http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev

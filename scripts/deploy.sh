#!/bin/bash

# 部署脚本
# 使用方法: bash scripts/deploy.sh <APP_NAME> [ENVIRONMENT]
# ENVIRONMENT: "staging" (测试) 或 "prod" (正式), 默认为 "staging"

# --- 配置 ---
# 从第一个命令行参数获取应用名 (e.g., "APP1")
APP_NAME=$1
# 从第二个命令行参数获取环境，如果未提供，则默认为 'staging'
ENVIRONMENT=${2:-prod}

# 根据环境选择配置
if [ "$ENVIRONMENT" = "prod" ]; then
    # --- 正式环境配置 ---
    REMOTE_USER="root"
    REMOTE_HOST="66.66.66.66" # 你的正式服务器 IP
    REMOTE_BASE_PATH="~/web_prod" # 你的正式服务器部署路径
    echo "🌱 当前为 [正式环境] 部署"
else
    # --- 测试环境配置 ---
    REMOTE_USER="root"
    REMOTE_HOST="66.66.66.66" # 你的测试服务器 IP
    REMOTE_BASE_PATH="~/web_dev" # 你的测试服务器部署路径
    echo "🧪 当前为 [测试环境] 部署"
fi
# --- 配置结束 ---

# 检查是否提供了应用名
if [ -z "$APP_NAME" ]; then
    echo "错误: 未提供应用名。"
    echo "用法: $0 <APP_NAME> [ENVIRONMENT]"
    exit 1
fi

# 构建本地产物目录的路径
LOCAL_DIST_PATH="apps/$APP_NAME/dist"

# 检查本地产物目录是否存在
if [ ! -d "$LOCAL_DIST_PATH" ]; then
    echo "错误: 未找到产物目录 '$LOCAL_DIST_PATH'。"
    echo "请确保已经为 '$APP_NAME' 执行了 build 命令。"
    exit 1
fi

# 构建远程服务器的目标路径
REMOTE_TARGET_PATH="$REMOTE_BASE_PATH/$APP_NAME"

echo "🚀 开始部署 '$APP_NAME' 到 $REMOTE_USER@$REMOTE_HOST:$REMOTE_TARGET_PATH"

# 使用 scp 命令上传文件
# -r: 递归复制整个目录
# -p: 保留文件修改时间和权限
# 注意: 这会覆盖目标目录的现有内容
# 你需要提前配置好 SSH 免密登录，否则每次都需要输入密码
scp -rp "$LOCAL_DIST_PATH"/* "$REMOTE_USER@$REMOTE_HOST:$REMOTE_TARGET_PATH/"

# 检查 scp 命令是否成功
if [ $? -eq 0 ]; then
    echo "✅ 成功: '$APP_NAME' 已成功部署到服务器。"
else
    echo "❌ 失败: 部署过程中发生错误。"
    exit 1
fi

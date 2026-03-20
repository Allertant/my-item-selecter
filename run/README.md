# 幸运转盘 - 启动说明文档

## 概述

本应用是一个基于 HTML/CSS/JavaScript 的幸运转盘工具，支持自定义项目、每日使用限制、历史记录等功能。

## 方式一：使用 Docker 部署（推荐）

### 1. 加载 Docker 镜像

如果从 tar 包加载：
```bash
docker load -i my-lucky-wheel.tar
```

### 2. 启动容器

```bash
docker run -d -p 8080:80 --name lucky-wheel my-lucky-wheel:latest
```

参数说明：
- `-d`: 后台运行
- `-p 8080:80`: 将容器内 80 端口映射到主机 8080 端口
- `--name lucky-wheel`: 容器名称

### 3. 访问应用

打开浏览器访问：`http://localhost:8080`

### 4. 常用 Docker 命令

```bash
# 查看容器状态
docker ps

# 查看容器日志
docker logs lucky-wheel

# 停止容器
docker stop lucky-wheel

# 启动已停止的容器
docker start lucky-wheel

# 删除容器
docker rm lucky-wheel

# 删除镜像
docker rmi my-lucky-wheel:latest
```

---

## 方式二：直接使用静态文件

### 前置要求

- 需要一个 Web 服务器（nginx、apache 或其他静态服务器）

### 部署步骤

1. **将文件复制到 Web 服务器目录**

```bash
# 对于 nginx
sudo cp -r index.html css js /var/www/html/

# 对于 apache
sudo cp -r index.html css js /var/www/
```

2. **配置 Web 服务器**

**Nginx 配置示例**：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/css application/javascript;
}
```

**Apache 配置示例**：
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www

    <Directory /var/www>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

3. **重启 Web 服务器**

```bash
# Nginx
sudo systemctl restart nginx

# Apache
sudo systemctl restart apache2
```

---

## 方式三：使用本地服务器（开发测试）

### 使用 Python

```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

访问：`http://localhost:8080`

### 使用 Node.js (http-server)

```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8080
```

访问：`http://localhost:8080`

### 使用 PHP

```bash
php -S localhost:8080
```

访问：`http://localhost:8080`

---

## 功能说明

### 1. 添加项目
- 在输入框中输入项目内容（最多20个字符）
- 点击"添加"按钮或按回车键
- 最多可添加 16 个项目

### 2. 开始转盘
- 点击"开始"按钮启动转盘
- 转盘会旋转 3 秒后停止
- 显示随机选中的结果

### 3. 删除项目
- 在项目列表中点击"删除"按钮

### 4. 清空项目
- 点击"清空所有"按钮删除所有项目

### 5. 配置每日使用限制
- 点击"⚙️ 配置"按钮打开配置弹窗
- 开启"开启每日使用限制"开关
- 设置每日最大使用次数（1-100）
- 使用次数会在每天午夜重置

### 6. 查看历史记录
- 点击"📜 历史"按钮查看历史记录
- 显示最近 100 条转盘记录
- 每条记录包含项目名称、时间和日期
- 点击"清空历史"可删除所有记录

### 7. 悬停提示
- 鼠标悬停在转盘上会显示当前指向的项目名称

---

## 数据存储

所有数据使用浏览器 localStorage 本地存储：
- **wheelItems**: 用户自定义的项目列表
- **wheelLimitEnabled**: 是否开启每日使用限制
- **wheelDailyLimit**: 每日最大使用次数
- **wheelUsageCount**: 今日已使用次数
- **wheelLastDate**: 最后使用日期
- **wheelHistory**: 转盘历史记录（最多100条）

**注意**：清除浏览器数据会丢失所有自定义设置和历史记录。

---

## 浏览器兼容性

- Chrome/Edge: ✅ 完全支持
- Firefox: ✅ 完全支持
- Safari: ✅ 完全支持
- 移动浏览器: ✅ 响应式设计，完美适配

---

## 故障排除

### 转盘显示为椭圆
- 确保 CSS 中的 `#wheelCanvas` 没有设置 `width: 100%`
- 检查 JavaScript 的 `setupCanvas()` 函数正常执行
- 尝试刷新页面

### 移动端显示异常
- 确保在移动端浏览器中缩放为 100%
- 检查是否启用了某些浏览器扩展
- 尝试在无痕模式下打开

### 历史记录丢失
- 检查是否清除了浏览器缓存
- 确认 localStorage 未被禁用
- 查看浏览器控制台是否有错误信息

### 每日限制不生效
- 确认已开启"每日使用限制"开关
- 检查系统时间是否正确
- 查看浏览器控制台是否有错误

---

## 技术栈

- **前端**: 原生 HTML5、CSS3、JavaScript (ES6+)
- **图形渲染**: HTML5 Canvas API
- **数据存储**: localStorage API
- **Web 服务器**: Nginx（Docker 环境）
- **容器化**: Docker

---

## 目录结构

```
my-item-selecter/
├── index.html              # 主页面
├── css/
│   └── styles.css         # 样式文件
├── js/
│   └── script.js          # JavaScript 逻辑
├── Dockerfile             # Docker 镜像构建文件
├── my-lucky-wheel.tar     # Docker 镜像 tar 包
└── run/
    └── README.md          # 本说明文档
```

---

## 许可证

本项目为个人使用项目，可自由修改和分发。

---

## 联系方式

如有问题或建议，请联系项目维护者。

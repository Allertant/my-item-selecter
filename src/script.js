// 颜色数组 - GitHub 风格黑白灰配色
const colors = [
    '#24292f', '#57606a', '#8b949e', '#6e7781',
    '#3a3f47', '#4a5058', '#6a737d', '#545d68',
    '#2c313a', '#7a828e', '#3d4450', '#8e959f',
    '#484f58', '#5c6370', '#9199a2', '#3b424c'
];

// 存储项目
let items = [];

// 获取DOM元素
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');

// 处理高DPI屏幕，提高清晰度
function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    
    // 根据容器宽度决定canvas尺寸
    // 移动端使用较小的尺寸以适应屏幕
    const isMobile = window.innerWidth <= 600;
    const maxSize = isMobile ? 280 : 400;
    const size = Math.min(maxSize, containerWidth);
    
    // 设置内部渲染分辨率
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    
    // 缩放绘图上下文以匹配DPR
    ctx.scale(dpr, dpr);
    
    // 设置CSS显示尺寸，确保宽高比为1:1
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    console.log('Canvas setup:', { dpr, containerWidth, size, isMobile });
}

// 初始化Canvas
setupCanvas();

// 窗口大小改变时重新设置canvas
window.addEventListener('resize', () => {
    setupCanvas();
    drawWheel(currentRotation);
});

const startBtn = document.getElementById('startBtn');
const itemInput = document.getElementById('itemInput');
const addItemBtn = document.getElementById('addItemBtn');
const itemsList = document.getElementById('itemsList');
const clearAllBtn = document.getElementById('clearAllBtn');
const resultModal = document.getElementById('resultModal');
const resultText = document.getElementById('resultText');
const closeModalBtn = document.querySelector('.close');
const limitToggle = document.getElementById('limitToggle');
const dailyLimitInput = document.getElementById('dailyLimit');
const usedCountSpan = document.getElementById('usedCount');
const remainingCountSpan = document.getElementById('remainingCount');
const configBtn = document.getElementById('configBtn');
const configModal = document.getElementById('configModal');
const closeConfigModalBtn = document.getElementById('closeConfigModal');
const wheelTooltip = document.getElementById('wheelTooltip');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryModalBtn = document.getElementById('closeHistoryModal');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// 转盘状态
let currentRotation = 0;
let isSpinning = false;

// 历史记录
let historyData = [];

// 加载历史记录
function loadHistory() {
    const stored = localStorage.getItem('wheelHistory');
    if (stored) {
        historyData = JSON.parse(stored);
    }
}

// 保存历史记录
function saveHistory() {
    localStorage.setItem('wheelHistory', JSON.stringify(historyData));
}

// 添加历史记录
function addHistory(item) {
    const now = new Date();
    const historyItem = {
        name: item,
        date: now.toLocaleDateString('zh-CN'),
        time: now.toLocaleTimeString('zh-CN')
    };
    historyData.unshift(historyItem);
    
    // 限制最多保存100条记录
    if (historyData.length > 100) {
        historyData = historyData.slice(0, 100);
    }
    
    saveHistory();
}

// 渲染历史记录
function renderHistory() {
    if (historyData.length === 0) {
        historyList.innerHTML = '<p class="empty-history">暂无历史记录</p>';
        return;
    }
    
    historyList.innerHTML = '';
    historyData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-name">${item.name}</div>
                <div class="history-item-time">${item.time}</div>
                <div class="history-item-date">${item.date}</div>
            </div>
            <div class="history-item-index">#${historyData.length - index}</div>
        `;
        historyList.appendChild(div);
    });
}

// 清空历史记录
function clearHistory() {
    if (historyData.length === 0) {
        return;
    }
    
    if (confirm('确定要清空所有历史记录吗？')) {
        historyData = [];
        saveHistory();
        renderHistory();
    }
}

// 历史记录弹窗相关函数
function openHistoryModal() {
    renderHistory();
    historyModal.style.display = 'block';
}

function closeHistoryModal() {
    historyModal.style.display = 'none';
}

// 配置弹窗相关函数
function openConfigModal() {
    configModal.style.display = 'block';
}

function closeConfigModal() {
    configModal.style.display = 'none';
}

// 使用限制配置
let limitEnabled = false;
let dailyLimit = 5;
let usedCount = 0;
let lastDate = '';

// 保存限制设置到localStorage
function saveLimitSettings() {
    localStorage.setItem('limitEnabled', limitEnabled);
    localStorage.setItem('dailyLimit', dailyLimit);
    localStorage.setItem('usedCount', usedCount);
    localStorage.setItem('lastDate', lastDate);
}

// 从localStorage加载限制设置
function loadLimitSettings() {
    limitEnabled = localStorage.getItem('limitEnabled') === 'true';
    dailyLimit = parseInt(localStorage.getItem('dailyLimit')) || 5;
    usedCount = parseInt(localStorage.getItem('usedCount')) || 0;
    lastDate = localStorage.getItem('lastDate') || '';
    
    // 检查日期是否变化，如果是新的一天，重置使用次数
    const today = new Date().toDateString();
    if (lastDate !== today) {
        usedCount = 0;
        lastDate = today;
        saveLimitSettings();
    }
    
    // 更新UI
    limitToggle.checked = limitEnabled;
    dailyLimitInput.value = dailyLimit;
    updateUsageDisplay();
}

// 更新使用次数显示
function updateUsageDisplay() {
    usedCountSpan.textContent = usedCount;
    const remaining = limitEnabled ? Math.max(0, dailyLimit - usedCount) : '∞';
    remainingCountSpan.textContent = remaining;
}

// 检查是否可以转动
function canSpin() {
    if (!limitEnabled) {
        return true;
    }
    
    if (usedCount >= dailyLimit) {
        alert(`今日使用次数已用完！请明天再试。\n\n每日限制：${dailyLimit} 次`);
        return false;
    }
    
    return true;
}

// 增加使用次数
function incrementUsage() {
    if (limitEnabled) {
        usedCount++;
        const today = new Date().toDateString();
        if (lastDate !== today) {
            lastDate = today;
        }
        saveLimitSettings();
        updateUsageDisplay();
    }
}

// 从localStorage加载项目
function loadItems() {
    const stored = localStorage.getItem('wheelItems');
    if (stored) {
        items = JSON.parse(stored);
        renderItemsList();
        drawWheel();
    }
}

// 保存项目到localStorage
function saveItems() {
    localStorage.setItem('wheelItems', JSON.stringify(items));
}

// 添加项目
function addItem() {
    const text = itemInput.value.trim();
    if (!text) {
        alert('请输入项目内容');
        return;
    }
    
    if (items.length >= 16) {
        alert('最多只能添加16个项目');
        return;
    }
    
    items.push(text);
    itemInput.value = '';
    saveItems();
    renderItemsList();
    drawWheel();
}

// 删除项目
function deleteItem(index) {
    items.splice(index, 1);
    saveItems();
    renderItemsList();
    drawWheel();
}

// 清空所有项目
function clearAllItems() {
    if (items.length === 0) {
        return;
    }
    
    if (confirm('确定要清空所有项目吗？')) {
        items = [];
        saveItems();
        renderItemsList();
        drawWheel();
    }
}

// 渲染项目列表
function renderItemsList() {
    if (items.length === 0) {
        itemsList.innerHTML = '<p class="empty-message">暂无项目，请添加项目</p>';
        startBtn.disabled = true;
        return;
    }
    
    itemsList.innerHTML = '';
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.style.borderLeftColor = colors[index % colors.length];
        div.innerHTML = `
            <span class="item-name">${item}</span>
            <button class="delete-btn" onclick="deleteItem(${index})">删除</button>
        `;
        itemsList.appendChild(div);
    });
    
    startBtn.disabled = false;
}

// 绘制转盘
function drawWheel(rotation = 0) {
    // 获取实际的canvas尺寸（逻辑尺寸）
    const canvasWidth = parseFloat(canvas.style.width);
    const canvasHeight = parseFloat(canvas.style.height);
    const logicalWidth = canvasWidth;
    const logicalHeight = canvasHeight;
    const centerX = logicalWidth / 2;
    const centerY = logicalHeight / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    
    if (items.length === 0) {
        // 绘制空白转盘
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f6f8fa';
        ctx.fill();
        ctx.strokeStyle = '#d0d7de';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = '#656d76';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('请添加项目', centerX, centerY);
        return;
    }
    
    const sliceAngle = (Math.PI * 2) / items.length;
    
    // 绘制每个扇形
    items.forEach((item, index) => {
        const startAngle = index * sliceAngle + rotation;
        const endAngle = startAngle + sliceAngle;
        
        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // 绘制边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制文字 - 始终水平显示
        const midAngle = startAngle + sliceAngle / 2;
        const textRadius = radius * 0.6;
        const textX = centerX + Math.cos(midAngle) * textRadius;
        const textY = centerY + Math.sin(midAngle) * textRadius;
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 增强文字阴影，提升清晰度
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
        
        // 文字截断
        let text = item;
        if (text.length > 6) {
            text = text.substring(0, 5) + '...';
        }
        
        ctx.fillText(text, textX, textY);
        ctx.restore();
    });
    
    // 绘制中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#d0d7de';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#24292f';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GO', centerX, centerY);
}

// 缓动函数 - easeOutCubic
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// 开始转动
function startSpin() {
    if (isSpinning || items.length === 0) {
        console.log('无法开始旋转:', { isSpinning, itemsLength: items.length });
        return;
    }
    
    // 检查使用限制
    if (!canSpin()) {
        alert('今日使用次数已用完');
        return;
    }
    
    isSpinning = true;
    startBtn.disabled = true;
    addItemBtn.disabled = true;
    clearAllBtn.disabled = true;
    
    // 随机选择一个结果
    const resultIndex = Math.floor(Math.random() * items.length);
    console.log('选中结果索引:', resultIndex);
    
    // 计算需要旋转的角度
    // 至少旋转5圈
    const minSpins = 5;
    const sliceAngle = (Math.PI * 2) / items.length;
    
    // 指针在顶部（270度位置 = 3π/2）
    // 我们需要让 resultIndex 扇形的起始边对齐到指针位置
    // 添加一个小偏移量让指针指向扇形中间
    const pointerAngle = (3 * Math.PI) / 2; // 270度
    const targetSliceStart = pointerAngle - sliceAngle / 2; // 扇形应该在的位置
    
    // 计算最终的旋转角度
    // resultIndex 扇形的起始边在：resultIndex * sliceAngle + finalRotation % (2π)
    // 我们需要：resultIndex * sliceAngle + finalRotation ≡ targetSliceStart (mod 2π)
    // 所以：finalRotation ≡ targetSliceStart - resultIndex * sliceAngle (mod 2π)
    
    // 计算基准目标角度
    const baseTargetRotation = targetSliceStart - resultIndex * sliceAngle;
    
    // 加上最小旋转圈数
    let targetRotation = baseTargetRotation + (minSpins * Math.PI * 2);
    
    // 确保比当前旋转角度大（顺时针旋转）
    // 至少增加一个完整圆周，确保有明显旋转
    const minTotalRotation = Math.PI * 2 * (minSpins + 0.5); // 至少转5.5圈
    while (targetRotation - currentRotation < minTotalRotation) {
        targetRotation += Math.PI * 2;
    }
    
    const duration = 3000; // 3秒
    const startTime = performance.now();
    const startRotation = currentRotation;
    const totalRotation = targetRotation - startRotation;
    
    console.log('旋转参数:', {
        currentRotation,
        targetRotation,
        totalRotation,
        minTotalRotation
    });
    
    if (totalRotation <= 0) {
        console.error('无效的旋转角度，取消动画');
        isSpinning = false;
        startBtn.disabled = false;
        addItemBtn.disabled = false;
        clearAllBtn.disabled = false;
        return;
    }
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easedProgress = easeOutCubic(progress);
        
        currentRotation = startRotation + totalRotation * easedProgress;
        drawWheel(currentRotation);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 动画结束
            isSpinning = false;
            startBtn.disabled = false;
            addItemBtn.disabled = false;
            clearAllBtn.disabled = false;
            
            console.log('动画结束，最终角度:', currentRotation);
            
            // 增加使用次数
            incrementUsage();
            
            // 添加到历史记录
            addHistory(items[resultIndex]);
            
            // 显示结果
            showResult(items[resultIndex]);
        }
    }
    
    // 启动动画
    requestAnimationFrame(animate);
    
    requestAnimationFrame(animate);
}

// 显示结果
function showResult(text) {
    resultText.textContent = text;
    resultModal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    resultModal.style.display = 'none';
}

// 配置弹窗相关函数
function openConfigModal() {
    configModal.style.display = 'block';
}

function closeConfigModal() {
    configModal.style.display = 'none';
}

// 事件监听
startBtn.addEventListener('click', startSpin);
addItemBtn.addEventListener('click', addItem);
clearAllBtn.addEventListener('click', clearAllItems);
closeModalBtn.addEventListener('click', closeModal);

// 回车键添加项目
itemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItem();
    }
});

// 点击模态框外部关闭
resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        closeModal();
    }
});

// 限制开关事件
limitToggle.addEventListener('change', (e) => {
    limitEnabled = e.target.checked;
    saveLimitSettings();
    updateUsageDisplay();
});

// 每日限制输入事件
dailyLimitInput.addEventListener('change', (e) => {
    const value = parseInt(e.target.value);
    if (value < 1 || value > 100) {
        alert('每日限制次数必须在1-100之间');
        e.target.value = dailyLimit;
        return;
    }
    dailyLimit = value;
    saveLimitSettings();
    updateUsageDisplay();
});

// 配置按钮点击事件
configBtn.addEventListener('click', openConfigModal);

// 关闭配置弹窗事件
closeConfigModalBtn.addEventListener('click', closeConfigModal);

// 点击配置弹窗外部关闭
configModal.addEventListener('click', (e) => {
    if (e.target === configModal) {
        closeConfigModal();
    }
});

// 历史记录按钮点击事件
historyBtn.addEventListener('click', openHistoryModal);

// 关闭历史记录弹窗事件
closeHistoryModalBtn.addEventListener('click', closeHistoryModal);

// 清空历史记录事件
clearHistoryBtn.addEventListener('click', clearHistory);

// 点击历史记录弹窗外部关闭
historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        closeHistoryModal();
    }
});

// 转盘鼠标移动事件 - 显示对应的item名称
canvas.addEventListener('mousemove', (e) => {
    if (items.length === 0 || isSpinning) {
        wheelTooltip.style.display = 'none';
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 计算鼠标相对于转盘中心的角度
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 检查鼠标是否在转盘半径内
    const radius = Math.min(centerX, centerY) - 10;
    if (distance > radius || distance < 30) {
        wheelTooltip.style.display = 'none';
        return;
    }
    
    // 计算角度（考虑当前旋转）
    let angle = Math.atan2(dy, dx);
    if (angle < 0) {
        angle += Math.PI * 2;
    }
    
    // 考虑转盘的旋转偏移
    const normalizedRotation = (currentRotation % (Math.PI * 2));
    const effectiveAngle = (angle - normalizedRotation + Math.PI * 2) % (Math.PI * 2);
    
    // 计算对应的扇形索引
    const sliceAngle = (Math.PI * 2) / items.length;
    const index = Math.floor(effectiveAngle / sliceAngle);
    
    // 显示tooltip
    const itemName = items[index];
    if (itemName) {
        wheelTooltip.textContent = itemName;
        wheelTooltip.style.display = 'block';
        wheelTooltip.style.left = (e.pageX + 15) + 'px';
        wheelTooltip.style.top = (e.pageY + 15) + 'px';
    }
});

// 鼠标离开转盘隐藏tooltip
canvas.addEventListener('mouseleave', () => {
    wheelTooltip.style.display = 'none';
});

// 初始化
loadItems();
loadLimitSettings();
loadHistory();
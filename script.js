let isRunning = false;
let currentTimeout;
let speed = 1500;
let showConnections = true;
let isDragging = false;
let dragTarget = null;
let dragOffset = { x: 0, y: 0 };
let connectionMode = 'curved'; // 'curved' 或 'orthogonal'
let flowSpeed = 2000; // 光点流动速度（毫秒）
let activeFlowAnimations = []; // 存储活动的流动动画
let currentLanguage = 'en'; // 默认语言为英语
let currentZoom = 100; // 当前缩放比例
let autoResponsiveZoom = true; // 是否启用自动响应式缩放

// 多语言数据
const languages = {
    'zh-CN': {
        name: '简体中文',
        flag: '🇨🇳',
        modules: {
            'external-stimuli': 'External Stimuli<br>外部刺激',
            'perception': 'Perception & Input<br>感知与输入模块',
            'ai-cognitive': 'AI Cognitive Core<br>AI认知核心',
            'thinking-core': 'Thinking Core<br>思维核心',
            'personality': 'Personality & Emotion<br>个性与情感核心',
            'skills': 'Skills Module<br>技能模块',
            'needs': 'Needs & Motivation<br>需求与动机系统',
            'planning': 'Planning System<br>规划系统',
            'relationship': 'Relationship Module<br>关系模块',
            'action-output': 'Action & Output<br>行动与输出模块',
            'environment': 'Environment Interaction<br>环境交互模块',
            'memory': 'Memory System<br>记忆系统',
            'global-time': 'Global Time System<br>全局时间系统'
        },
        descriptions: {
            'external-stimuli': '外部刺激：接收来自环境的信息输入',
            'perception': '感知模块：处理和解析输入信息',
            'ai-cognitive': 'AI认知核心：整合信息并进行认知处理',
            'thinking-core': '思维核心：进行深层思考和决策',
            'personality': '个性模块：根据个性特征调整响应',
            'skills': '技能模块：运用相关技能处理信息',
            'needs': '需求模块：评估需求和动机',
            'planning': '规划模块：制定行动计划',
            'relationship': '关系模块：考虑社交关系因素',
            'action-output': '输出模块：生成最终响应',
            'environment': '环境交互：与外界环境交互',
            'memory': '记忆系统：存储和提取记忆信息',
            'global-time': '时间系统：协调系统时序'
        },
        ui: {
            title: 'AI认知系统 - 信息传导模拟器',
            startSimulation: '开始模拟',
            stopSimulation: '停止模拟',
            reset: '重置',
            hideConnections: '隐藏连接线',
            showConnections: '显示连接线',
            switchToCurved: '切换为曲线',
            switchToOrthogonal: '切换为直角',
            showAnchors: '显示锚点',
            hideAnchors: '隐藏锚点',
            simulationSpeed: '模拟速度',
            flowSpeed: '流动速度',
            currentActiveModule: '当前活动模块',
            clickToStart: '点击"开始模拟"按钮开始信息传导演示',
            operationHints: '💡 操作提示：',
            dragModules: '• 拖拽模块改变位置',
            autoUpdate: '• 连接线会自动更新',
            toggleConnections: '• 切换连接线显示/隐藏',
            intelligentSystem: '🧠 智能连接系统：',
            smartAnchors: '• 智能锚点：自动选择最佳连接点',
            dualModes: '• 曲线/直角两种连接模式',
            realTimeUpdate: '• 拖拽模块，连接线实时更新',
            debugMode: '• 支持锚点可视化调试',
            controlHint: '未启动状态下可以拖动模块',
            orientationTitle: '建议横屏查看',
            orientationText: '为了最佳体验，请将设备旋转至横屏模式'
        }
    },
    'zh-TW': {
        name: '繁體中文',
        flag: '🇹🇼',
        modules: {
            'external-stimuli': 'External Stimuli<br>外部刺激',
            'perception': 'Perception & Input<br>感知與輸入模組',
            'ai-cognitive': 'AI Cognitive Core<br>AI認知核心',
            'thinking-core': 'Thinking Core<br>思維核心',
            'personality': 'Personality & Emotion<br>個性與情感核心',
            'skills': 'Skills Module<br>技能模組',
            'needs': 'Needs & Motivation<br>需求與動機系統',
            'planning': 'Planning System<br>規劃系統',
            'relationship': 'Relationship Module<br>關係模組',
            'action-output': 'Action & Output<br>行動與輸出模組',
            'environment': 'Environment Interaction<br>環境交互模組',
            'memory': 'Memory System<br>記憶系統',
            'global-time': 'Global Time System<br>全域時間系統'
        },
        descriptions: {
            'external-stimuli': '外部刺激：接收來自環境的資訊輸入',
            'perception': '感知模組：處理和解析輸入資訊',
            'ai-cognitive': 'AI認知核心：整合資訊並進行認知處理',
            'thinking-core': '思維核心：進行深層思考和決策',
            'personality': '個性模組：根據個性特徵調整回應',
            'skills': '技能模組：運用相關技能處理資訊',
            'needs': '需求模組：評估需求和動機',
            'planning': '規劃模組：制定行動計劃',
            'relationship': '關係模組：考慮社交關係因素',
            'action-output': '輸出模組：生成最終回應',
            'environment': '環境交互：與外界環境交互',
            'memory': '記憶系統：儲存和提取記憶資訊',
            'global-time': '時間系統：協調系統時序'
        },
        ui: {
            title: 'AI認知系統 - 資訊傳導模擬器',
            startSimulation: '開始模擬',
            stopSimulation: '停止模擬',
            reset: '重置',
            hideConnections: '隱藏連接線',
            showConnections: '顯示連接線',
            switchToCurved: '切換為曲線',
            switchToOrthogonal: '切換為直角',
            showAnchors: '顯示錨點',
            hideAnchors: '隱藏錨點',
            simulationSpeed: '模擬速度',
            flowSpeed: '流動速度',
            currentActiveModule: '當前活動模組',
            clickToStart: '點擊"開始模擬"按鈕開始資訊傳導演示',
            operationHints: '💡 操作提示：',
            dragModules: '• 拖拽模組改變位置',
            autoUpdate: '• 連接線會自動更新',
            toggleConnections: '• 切換連接線顯示/隱藏',
            intelligentSystem: '🧠 智慧連接系統：',
            smartAnchors: '• 智慧錨點：自動選擇最佳連接點',
            dualModes: '• 曲線/直角兩種連接模式',
            realTimeUpdate: '• 拖拽模組，連接線即時更新',
            debugMode: '• 支援錨點視覺化除錯',
            controlHint: '未啟動狀態下可以拖動模組',
            orientationTitle: '建議橫屏查看',
            orientationText: '為了最佳體驗，請將設備旋轉至橫屏模式'
        }
    },
    'en': {
        name: 'English',
        flag: '🇺🇸',
        modules: {
            'external-stimuli': 'External Stimuli<br>Information Input',
            'perception': 'Perception & Input<br>Sensory Processing',
            'ai-cognitive': 'AI Cognitive Core<br>Central Processing',
            'thinking-core': 'Thinking Core<br>Decision Making',
            'personality': 'Personality & Emotion<br>Character Traits',
            'skills': 'Skills Module<br>Capability Processing',
            'needs': 'Needs & Motivation<br>Drive System',
            'planning': 'Planning System<br>Strategy Formation',
            'relationship': 'Relationship Module<br>Social Processing',
            'action-output': 'Action & Output<br>Response Generation',
            'environment': 'Environment Interaction<br>External Interface',
            'memory': 'Memory System<br>Information Storage',
            'global-time': 'Global Time System<br>Temporal Coordination'
        },
        descriptions: {
            'external-stimuli': 'External Stimuli: Receives information input from environment',
            'perception': 'Perception Module: Processes and analyzes input information',
            'ai-cognitive': 'AI Cognitive Core: Integrates information and performs cognitive processing',
            'thinking-core': 'Thinking Core: Conducts deep thinking and decision making',
            'personality': 'Personality Module: Adjusts responses based on personality traits',
            'skills': 'Skills Module: Applies relevant skills to process information',
            'needs': 'Needs Module: Evaluates needs and motivations',
            'planning': 'Planning Module: Formulates action plans',
            'relationship': 'Relationship Module: Considers social relationship factors',
            'action-output': 'Output Module: Generates final responses',
            'environment': 'Environment Interaction: Interacts with external environment',
            'memory': 'Memory System: Stores and retrieves memory information',
            'global-time': 'Time System: Coordinates system timing'
        },
        ui: {
            title: 'AI Cognitive System - Information Flow Simulator',
            startSimulation: 'Start Simulation',
            stopSimulation: 'Stop Simulation',
            reset: 'Reset',
            hideConnections: 'Hide Connections',
            showConnections: 'Show Connections',
            switchToCurved: 'Switch to Curved',
            switchToOrthogonal: 'Switch to Orthogonal',
            showAnchors: 'Show Anchors',
            hideAnchors: 'Hide Anchors',
            simulationSpeed: 'Simulation Speed',
            flowSpeed: 'Flow Speed',
            currentActiveModule: 'Current Active Module',
            clickToStart: 'Click "Start Simulation" to begin information flow demonstration',
            operationHints: '💡 Operation Hints:',
            dragModules: '• Drag modules to change position',
            autoUpdate: '• Connection lines update automatically',
            toggleConnections: '• Toggle connection display on/off',
            intelligentSystem: '🧠 Intelligent Connection System:',
            smartAnchors: '• Smart Anchors: Auto-select optimal connection points',
            dualModes: '• Curved/Orthogonal dual connection modes',
            realTimeUpdate: '• Drag modules for real-time connection updates',
            debugMode: '• Support anchor point visualization debugging',
            controlHint: 'Drag modules when simulation is stopped',
            orientationTitle: 'Landscape View Recommended',
            orientationText: 'For best experience, please rotate your device to landscape mode'
        }
    },
    'ja': {
        name: '日本語',
        flag: '🇯🇵',
        modules: {
            'external-stimuli': 'External Stimuli<br>外部刺激',
            'perception': 'Perception & Input<br>知覚・入力モジュール',
            'ai-cognitive': 'AI Cognitive Core<br>AI認知コア',
            'thinking-core': 'Thinking Core<br>思考コア',
            'personality': 'Personality & Emotion<br>性格・感情コア',
            'skills': 'Skills Module<br>スキルモジュール',
            'needs': 'Needs & Motivation<br>需要・動機システム',
            'planning': 'Planning System<br>企画システム',
            'relationship': 'Relationship Module<br>関係モジュール',
            'action-output': 'Action & Output<br>行動・出力モジュール',
            'environment': 'Environment Interaction<br>環境インタラクション',
            'memory': 'Memory System<br>メモリシステム',
            'global-time': 'Global Time System<br>グローバル時間システム'
        },
        descriptions: {
            'external-stimuli': '外部刺激：環境からの情報入力を受信',
            'perception': '知覚モジュール：入力情報を処理・解析',
            'ai-cognitive': 'AI認知コア：情報を統合し認知処理を実行',
            'thinking-core': '思考コア：深層思考と意思決定を実行',
            'personality': '性格モジュール：性格特性に基づいて応答を調整',
            'skills': 'スキルモジュール：関連スキルを活用して情報処理',
            'needs': '需要モジュール：需要と動機を評価',
            'planning': '企画モジュール：行動計画を策定',
            'relationship': '関係モジュール：社会的関係要因を考慮',
            'action-output': '出力モジュール：最終応答を生成',
            'environment': '環境インタラクション：外部環境との相互作用',
            'memory': 'メモリシステム：記憶情報の保存・取得',
            'global-time': '時間システム：システムタイミングの調整'
        },
        ui: {
            title: 'AI認知システム - 情報伝達シミュレータ',
            startSimulation: 'シミュレーション開始',
            stopSimulation: 'シミュレーション停止',
            reset: 'リセット',
            hideConnections: '接続線を非表示',
            showConnections: '接続線を表示',
            switchToCurved: '曲線に切り替え',
            switchToOrthogonal: '直角に切り替え',
            showAnchors: 'アンカーポイント表示',
            hideAnchors: 'アンカーポイント非表示',
            simulationSpeed: 'シミュレーション速度',
            flowSpeed: 'フロー速度',
            currentActiveModule: '現在のアクティブモジュール',
            clickToStart: '「シミュレーション開始」ボタンをクリックして情報伝達デモを開始',
            operationHints: '💡 操作ヒント：',
            dragModules: '• モジュールをドラッグして位置を変更',
            autoUpdate: '• 接続線が自動的に更新されます',
            toggleConnections: '• 接続線の表示/非表示を切り替え',
            intelligentSystem: '🧠 インテリジェント接続システム：',
            smartAnchors: '• スマートアンカー：最適な接続点を自動選択',
            dualModes: '• 曲線/直角の2つの接続モード',
            realTimeUpdate: '• モジュールをドラッグしてリアルタイム接続更新',
            debugMode: '• アンカーポイントの視覚化デバッグをサポート',
            controlHint: 'シミュレーション停止時にモジュールをドラッグ可能',
            orientationTitle: '横画面表示を推奨',
            orientationText: '最適な体験のため、デバイスを横向きに回転してください'
        }
    }
};

const connections = [
    ['external-stimuli', 'perception'],
    ['perception', 'ai-cognitive'],
    ['ai-cognitive', 'thinking-core'],
    ['thinking-core', 'personality'],
    ['thinking-core', 'skills'],
    ['thinking-core', 'needs'],
    ['thinking-core', 'planning'],
    ['thinking-core', 'relationship'],
    ['personality', 'action-output'],
    ['skills', 'action-output'],
    ['needs', 'action-output'],
    ['planning', 'action-output'],
    ['relationship', 'action-output'],
    ['action-output', 'environment'],
    ['environment', 'memory'],
    ['memory', 'ai-cognitive'],
    ['global-time', 'ai-cognitive'],
    ['ai-cognitive', 'memory']
];

const flowSequence = [
    'external-stimuli',
    'perception',
    'ai-cognitive',
    'thinking-core',
    'personality',
    'skills',
    'needs',
    'planning',
    'relationship',
    'action-output',
    'environment',
    'memory'
];

// 强制绘制连接线函数
function forceDrawConnections() {
    console.log('强制绘制连接线');
    drawConnections();
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM内容加载完成');
    setupDragAndDrop();
    setupEventListeners();
    
    // 初始化多语言系统
    initializeLanguageSystem();
    
    // 初始化缩放控制器
    initZoomControls();
    
    // 初始化响应式布局
    handleResponsiveLayout();
    
    // 同步SVG缩放
    setTimeout(() => {
        syncSVGScale();
    }, 100);
    
    // 检查屏幕方向
    checkOrientation();
    
    // 多次尝试绘制连接线
    setTimeout(() => {
        console.log('第一次尝试绘制连接线');
        drawConnections();
    }, 100);
    
    setTimeout(() => {
        console.log('第二次尝试绘制连接线');
        drawConnections();
    }, 500);
    
    setTimeout(() => {
        console.log('第三次尝试绘制连接线');
        drawConnections();
    }, 1000);
});

// 页面完全加载后再次尝试
window.addEventListener('load', function() {
    console.log('页面完全加载');
    setTimeout(() => {
        console.log('页面加载后绘制连接线');
        drawConnections();
        handleResponsiveLayout();
        syncSVGScale();
        checkOrientation();
    }, 200);
});

function setupEventListeners() {
    // 速度滑块事件
    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
        speedSlider.addEventListener('input', function(e) {
            speed = parseInt(e.target.value);
        });
    }

    // 流动速度滑块事件
    const flowSpeedSlider = document.getElementById('flow-speed-slider');
    if (flowSpeedSlider) {
        flowSpeedSlider.addEventListener('input', function(e) {
            setFlowSpeed(parseInt(e.target.value));
        });
    }

    // 模块点击事件（非拖拽时）
    document.querySelectorAll('.module').forEach(module => {
        module.addEventListener('click', function(e) {
            if (!isRunning && !isDragging) {
                activateModule(this.id);
            }
        });
    });

    // 窗口大小改变时重新绘制连接线
    window.addEventListener('resize', () => {
        setTimeout(() => {
            drawConnections();
            handleResponsiveLayout();
            syncSVGScale();
            checkOrientation();
        }, 100);
    });
}

// 获取模块中心点（方案B：坐标补偿）
function getModuleCenter(moduleId) {
    const module = document.getElementById(moduleId);
    if (!module) {
        console.warn(`Module ${moduleId} not found`);
        return { x: 0, y: 0 };
    }
    
    const rect = module.getBoundingClientRect();
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    
    // 计算相对于容器的中心点位置
    let centerX = rect.left - containerRect.left + rect.width / 2;
    let centerY = rect.top - containerRect.top + rect.height / 2;
    
    // 获取当前缩放比例并补偿坐标
    const containerStyle = window.getComputedStyle(container);
    const transform = containerStyle.transform;
    
    if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(',').map(parseFloat);
            const scaleX = values[0];
            const scaleY = values[3];
            
            // 将缩放后的坐标转换为SVG原始坐标系统
            centerX = centerX / scaleX;
            centerY = centerY / scaleY;
        }
    }
    
    return { x: centerX, y: centerY };
}

// 获取模块的4个锚点（方案B：坐标补偿）
function getModuleAnchorPoints(moduleId) {
    const module = document.getElementById(moduleId);
    if (!module) {
        console.warn(`Module ${moduleId} not found`);
        return null;
    }
    
    const rect = module.getBoundingClientRect();
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    
    // 计算相对于容器的位置
    let moduleLeft = rect.left - containerRect.left;
    let moduleTop = rect.top - containerRect.top;
    let moduleWidth = rect.width;
    let moduleHeight = rect.height;
    
    // 获取当前缩放比例并补偿坐标
    const containerStyle = window.getComputedStyle(container);
    const transform = containerStyle.transform;
    
    if (transform && transform !== 'none') {
        const matrix = transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
            const values = matrix[1].split(',').map(parseFloat);
            const scaleX = values[0];
            const scaleY = values[3];
            
            // 将缩放后的坐标转换为SVG原始坐标系统
            moduleLeft = moduleLeft / scaleX;
            moduleTop = moduleTop / scaleY;
            moduleWidth = moduleWidth / scaleX;
            moduleHeight = moduleHeight / scaleY;
        }
    }
    
    return {
        top: { 
            x: moduleLeft + moduleWidth / 2, 
            y: moduleTop, 
            direction: 'top' 
        },
        right: { 
            x: moduleLeft + moduleWidth, 
            y: moduleTop + moduleHeight / 2, 
            direction: 'right' 
        },
        bottom: { 
            x: moduleLeft + moduleWidth / 2, 
            y: moduleTop + moduleHeight, 
            direction: 'bottom' 
        },
        left: { 
            x: moduleLeft, 
            y: moduleTop + moduleHeight / 2, 
            direction: 'left' 
        }
    };
}

// 选择最佳连接锚点对
function selectBestAnchorPair(fromAnchors, toAnchors) {
    let bestDistance = Infinity;
    let bestPair = null;
    
    ['top', 'right', 'bottom', 'left'].forEach(fromDir => {
        ['top', 'right', 'bottom', 'left'].forEach(toDir => {
            const fromAnchor = fromAnchors[fromDir];
            const toAnchor = toAnchors[toDir];
            
            // 避免相互冲突的连接（如：右->右）
            if (areAnchorsConflicting(fromDir, toDir)) return;
            
            const distance = Math.sqrt(
                Math.pow(fromAnchor.x - toAnchor.x, 2) + 
                Math.pow(fromAnchor.y - toAnchor.y, 2)
            );
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestPair = { from: fromAnchor, to: toAnchor };
            }
        });
    });
    
    return bestPair;
}

// 检查锚点方向是否冲突
function areAnchorsConflicting(fromDir, toDir) {
    const conflicts = [
        ['right', 'left'],
        ['left', 'right'], 
        ['top', 'bottom'],
        ['bottom', 'top']
    ];
    
    return conflicts.some(([dir1, dir2]) => 
        (fromDir === dir1 && toDir === dir2) || 
        (fromDir === dir2 && toDir === dir1)
    );
}

// 创建曲线路径
function createCurvedPath(fromAnchor, toAnchor) {
    const dx = toAnchor.x - fromAnchor.x;
    const dy = toAnchor.y - fromAnchor.y;
    
    // 计算控制点偏移量
    const controlOffset = Math.max(Math.abs(dx), Math.abs(dy)) * 0.3;
    
    let cp1x = fromAnchor.x;
    let cp1y = fromAnchor.y;
    let cp2x = toAnchor.x;
    let cp2y = toAnchor.y;
    
    // 根据锚点方向调整控制点
    switch (fromAnchor.direction) {
        case 'top': cp1y -= controlOffset; break;
        case 'bottom': cp1y += controlOffset; break;
        case 'left': cp1x -= controlOffset; break;
        case 'right': cp1x += controlOffset; break;
    }
    
    switch (toAnchor.direction) {
        case 'top': cp2y -= controlOffset; break;
        case 'bottom': cp2y += controlOffset; break;
        case 'left': cp2x -= controlOffset; break;
        case 'right': cp2x += controlOffset; break;
    }
    
    return `M ${fromAnchor.x} ${fromAnchor.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toAnchor.x} ${toAnchor.y}`;
}

// 创建直角折线路径
function createOrthogonalPath(fromAnchor, toAnchor) {
    const padding = 20; // 折线的最小偏移距离
    
    let midX, midY;
    let path = `M ${fromAnchor.x} ${fromAnchor.y}`;
    
    // 根据锚点方向选择折线策略
    if (fromAnchor.direction === 'right' && toAnchor.direction === 'left') {
        midX = (fromAnchor.x + toAnchor.x) / 2;
        path += ` L ${midX} ${fromAnchor.y} L ${midX} ${toAnchor.y}`;
    } else if (fromAnchor.direction === 'left' && toAnchor.direction === 'right') {
        midX = (fromAnchor.x + toAnchor.x) / 2;
        path += ` L ${midX} ${fromAnchor.y} L ${midX} ${toAnchor.y}`;
    } else if (fromAnchor.direction === 'bottom' && toAnchor.direction === 'top') {
        midY = (fromAnchor.y + toAnchor.y) / 2;
        path += ` L ${fromAnchor.x} ${midY} L ${toAnchor.x} ${midY}`;
    } else if (fromAnchor.direction === 'top' && toAnchor.direction === 'bottom') {
        midY = (fromAnchor.y + toAnchor.y) / 2;
        path += ` L ${fromAnchor.x} ${midY} L ${toAnchor.x} ${midY}`;
    } else {
        // 通用L形连接
        if (fromAnchor.direction === 'right' || fromAnchor.direction === 'left') {
            path += ` L ${toAnchor.x} ${fromAnchor.y}`;
        } else {
            path += ` L ${fromAnchor.x} ${toAnchor.y}`;
        }
    }
    
    path += ` L ${toAnchor.x} ${toAnchor.y}`;
    return path;
}

function drawConnections() {
    console.log('开始绘制智能连接线，模式:', connectionMode);
    const svg = document.getElementById('connections-svg');
    if (!svg) {
        console.error('SVG element not found');
        return;
    }
    
    console.log('SVG元素找到:', svg);
    svg.innerHTML = '';

    if (!showConnections) {
        console.log('连接线显示已关闭');
        return;
    }

    console.log('开始绘制', connections.length, '条连接线');
    let successCount = 0;

    connections.forEach(([from, to], index) => {
        console.log(`处理连接: ${from} -> ${to}`);
        
        // 获取模块锚点
        const fromAnchors = getModuleAnchorPoints(from);
        const toAnchors = getModuleAnchorPoints(to);

        if (!fromAnchors || !toAnchors) {
            console.warn(`无法获取模块锚点: ${from} 或 ${to}`);
            return;
        }

        // 选择最佳连接锚点对
        const anchorPair = selectBestAnchorPair(fromAnchors, toAnchors);
        if (!anchorPair) {
            console.warn(`无法找到合适的锚点对: ${from} -> ${to}`);
            return;
        }

        console.log(`连接锚点: ${from}(${anchorPair.from.direction}) -> ${to}(${anchorPair.to.direction})`);

        // 根据连接模式创建路径
        let pathData;
        if (connectionMode === 'curved') {
            pathData = createCurvedPath(anchorPair.from, anchorPair.to);
        } else {
            pathData = createOrthogonalPath(anchorPair.from, anchorPair.to);
        }

        // 创建路径元素
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#3498db');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.6');
        path.className = 'connection-line';
        path.id = `connection-${from}-${to}`;

        // 添加连接线样式
        if (connectionMode === 'curved') {
            path.setAttribute('stroke-linecap', 'round');
        } else {
            path.setAttribute('stroke-linejoin', 'round');
        }

        svg.appendChild(path);
        
        // 添加锚点可视化（调试用，可选）
        if (window.showAnchorPoints) {
            addAnchorPointVisualization(svg, anchorPair.from, '#e74c3c');
            addAnchorPointVisualization(svg, anchorPair.to, '#27ae60');
        }
        
        successCount++;
        console.log(`成功添加连接线 ${index + 1}`);
    });
    
    console.log(`完成绘制，成功: ${successCount}/${connections.length}, SVG子元素: ${svg.children.length}`);
}

// 添加锚点可视化（调试用）
function addAnchorPointVisualization(svg, anchor, color) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', anchor.x);
    circle.setAttribute('cy', anchor.y);
    circle.setAttribute('r', '4');
    circle.setAttribute('fill', color);
    circle.setAttribute('opacity', '0.8');
    circle.className = 'anchor-point';
    svg.appendChild(circle);
}

// 切换连接模式
function toggleConnectionMode() {
    connectionMode = connectionMode === 'curved' ? 'orthogonal' : 'curved';
    console.log('切换连接模式到:', connectionMode);
    
    // 更新按钮文本
    const button = document.getElementById('mode-toggle');
    if (button) {
        button.textContent = connectionMode === 'curved' ? '切换到直角' : '切换到曲线';
    }
    
    // 重新绘制连接线
    drawConnections();
}

// 切换锚点显示
function toggleAnchorPoints() {
    window.showAnchorPoints = !window.showAnchorPoints;
    console.log('锚点显示:', window.showAnchorPoints ? '开启' : '关闭');
    
    // 更新按钮文本
    const button = document.getElementById('anchor-toggle');
    if (button) {
        button.textContent = window.showAnchorPoints ? '隐藏锚点' : '显示锚点';
    }
    
    // 重新绘制连接线
    drawConnections();
}

function setupDragAndDrop() {
    const modules = document.querySelectorAll('.module');
    
    modules.forEach(module => {
        module.addEventListener('mousedown', startDrag);
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
}

function startDrag(e) {
    if (isRunning) return;
    
    isDragging = true;
    dragTarget = e.target.closest('.module');
    dragTarget.classList.add('dragging');
    
    const rect = dragTarget.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    
    e.preventDefault();
}

function drag(e) {
    if (!isDragging || !dragTarget) return;
    
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    
    // 确保模块不会拖出视窗
    const maxX = window.innerWidth - dragTarget.offsetWidth;
    const maxY = window.innerHeight - dragTarget.offsetHeight;
    
    dragTarget.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
    dragTarget.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    dragTarget.style.right = 'auto';
    dragTarget.style.bottom = 'auto';
    
    // 实时更新连接线
    drawConnections();
}

function endDrag() {
    if (dragTarget) {
        dragTarget.classList.remove('dragging');
        dragTarget = null;
    }
    isDragging = false;
}

function toggleConnections() {
    showConnections = !showConnections;
    const button = document.getElementById('connections-toggle');
    
    if (showConnections) {
        button.textContent = '隐藏连接线';
        button.classList.remove('active');
        drawConnections();
    } else {
        button.textContent = '显示连接线';
        button.classList.add('active');
        document.getElementById('connections-svg').innerHTML = '';
    }
}

function updateInfo(moduleId) {
    const infoElement = document.getElementById('current-info');
    const langData = languages[currentLanguage];
    if (infoElement && langData.descriptions[moduleId]) {
        infoElement.textContent = langData.descriptions[moduleId];
    }
}

function activateModule(moduleId) {
    // 清除所有活动状态
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    
    document.querySelectorAll('.connection-line').forEach(line => {
        line.classList.remove('active');
    });
    
    // 激活当前模块
    const module = document.getElementById(moduleId);
    if (module) {
        module.classList.add('active');
        updateInfo(moduleId);
        
        // 找到与当前模块相关的连接并创建流动动画
        connections.forEach(([from, to]) => {
            if (from === moduleId) {
                // 从当前模块流出
                setTimeout(() => {
                    animateConnectionFlow(from, to);
                }, 200);
            } else if (to === moduleId) {
                // 流入当前模块
                setTimeout(() => {
                    animateConnectionFlow(from, to);
                }, 100);
            }
        });
        
        // 创建信号粒子效果
        createSignalParticle(module);
    }
}

function createSignalParticle(module) {
    const signal = document.createElement('div');
    signal.className = 'signal';
    signal.style.left = (module.offsetLeft + module.offsetWidth/2 - 6) + 'px';
    signal.style.top = (module.offsetTop + module.offsetHeight/2 - 6) + 'px';
    
    // 动画移动信号
    signal.style.animation = 'signal-move 0.8s linear';
    
    document.body.appendChild(signal);
    
    setTimeout(() => {
        if (signal.parentNode) {
            signal.parentNode.removeChild(signal);
        }
    }, 800);
}

function startSimulation() {
    if (isRunning) return;
    
    isRunning = true;
    let currentIndex = 0;
    
    function nextStep() {
        if (!isRunning) return;
        
        const currentModuleId = flowSequence[currentIndex];
        activateModule(currentModuleId);
        
        // 预测下一个模块的连接流动
        const nextIndex = (currentIndex + 1) % flowSequence.length;
        const nextModuleId = flowSequence[nextIndex];
        
        // 查找当前模块到下一个模块的连接
        const connection = connections.find(([from, to]) => 
            from === currentModuleId && to === nextModuleId
        );
        
        if (connection) {
            setTimeout(() => {
                animateConnectionFlow(connection[0], connection[1]);
            }, speed * 0.7); // 在切换前开始流动动画
        }
        
        currentIndex = nextIndex;
        currentTimeout = setTimeout(nextStep, speed);
    }
    
    nextStep();
}

function stopSimulation() {
    isRunning = false;
    if (currentTimeout) {
        clearTimeout(currentTimeout);
    }
    stopAllFlowAnimations();
}

function resetSimulation() {
    stopSimulation();
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    document.querySelectorAll('.connection-line').forEach(line => {
        line.classList.remove('active');
    });
    const infoElement = document.getElementById('current-info');
    if (infoElement) {
        infoElement.textContent = '点击"开始模拟"按钮开始信息传导演示';
    }
}

// 背景粒子效果
function createBackgroundEffect() {
    const effect = document.createElement('div');
    effect.style.position = 'absolute';
    effect.style.width = '4px';
    effect.style.height = '4px';
    effect.style.background = 'rgba(255, 255, 255, 0.3)';
    effect.style.borderRadius = '50%';
    effect.style.left = Math.random() * window.innerWidth + 'px';
    effect.style.top = Math.random() * window.innerHeight + 'px';
    effect.style.animation = 'float 6s linear infinite';
    effect.style.zIndex = '-10';
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
        if (effect.parentNode) {
            effect.parentNode.removeChild(effect);
        }
    }, 6000);
}

// 启动背景效果
setInterval(createBackgroundEffect, 2000);

// 创建光点流动动画
function createFlowAnimation(pathElement, duration = flowSpeed) {
    // 创建光点元素
    const flowDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    flowDot.setAttribute('r', '4');
    flowDot.setAttribute('fill', '#00ff88');
    flowDot.setAttribute('opacity', '0.9');
    flowDot.setAttribute('filter', 'drop-shadow(0 0 8px #00ff88)');
    
    // 创建动画路径
    const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
    animateMotion.setAttribute('dur', duration + 'ms');
    animateMotion.setAttribute('repeatCount', '1');
    animateMotion.setAttribute('rotate', 'auto');
    
    // 使用路径的d属性作为动画路径
    const pathData = pathElement.getAttribute('d');
    animateMotion.innerHTML = `<mpath href="#${pathElement.id}"/>`;
    
    // 如果路径没有ID，创建一个
    if (!pathElement.id) {
        pathElement.id = 'path-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    flowDot.appendChild(animateMotion);
    
    // 添加到SVG
    const svg = document.getElementById('connections-svg');
    svg.appendChild(flowDot);
    
    // 开始动画
    animateMotion.beginElement();
    
    // 动画结束后清理
    setTimeout(() => {
        if (flowDot.parentNode) {
            flowDot.parentNode.removeChild(flowDot);
        }
    }, duration + 100);
    
    return { dot: flowDot, animation: animateMotion };
}

// 在连接线上创建流动效果
function animateConnectionFlow(fromModuleId, toModuleId) {
    const connectionId = `connection-${fromModuleId}-${toModuleId}`;
    const pathElement = document.getElementById(connectionId);
    
    if (pathElement) {
        // 高亮连接线
        pathElement.classList.add('active');
        
        // 创建多个光点以形成流动效果
        const numDots = 3; // 同时显示的光点数量
        const delay = flowSpeed / numDots; // 光点之间的延迟
        
        for (let i = 0; i < numDots; i++) {
            setTimeout(() => {
                const flowAnimation = createFlowAnimation(pathElement, flowSpeed);
                activeFlowAnimations.push(flowAnimation);
            }, i * delay);
        }
        
        // 一定时间后移除高亮
        setTimeout(() => {
            pathElement.classList.remove('active');
        }, flowSpeed);
    }
}

// 创建多重光点流动效果
function createMultipleFlowDots(pathElement, count = 3) {
    const animations = [];
    const interval = flowSpeed / count;
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const animation = createFlowAnimation(pathElement, flowSpeed);
            animations.push(animation);
        }, i * interval);
    }
    
    return animations;
}

// 停止所有流动动画
function stopAllFlowAnimations() {
    activeFlowAnimations.forEach(({ dot, animation }) => {
        if (dot && dot.parentNode) {
            dot.parentNode.removeChild(dot);
        }
        if (animation) {
            animation.endElement();
        }
    });
    activeFlowAnimations = [];
}

// 设置流动速度
function setFlowSpeed(newSpeed) {
    flowSpeed = newSpeed;
    console.log('Flow speed set to:', flowSpeed, 'ms');
}

// 切换语言函数
function switchLanguage(lang) {
    if (!languages[lang]) {
        console.warn('Language not supported:', lang);
        return;
    }
    
    currentLanguage = lang;
    updateLanguageDisplay();
    
    // 保存语言偏好到本地存储
    localStorage.setItem('preferredLanguage', lang);
    
    console.log('Language switched to:', languages[lang].name);
}

// 更新界面语言显示
function updateLanguageDisplay() {
    const langData = languages[currentLanguage];
    
    // 更新标题
    const title = document.querySelector('.system-title h1');
    if (title) {
        title.textContent = langData.ui.title;
    }
    
    // 更新模块名称
    Object.keys(langData.modules).forEach(moduleId => {
        const module = document.getElementById(moduleId);
        if (module) {
            const nameElement = module.querySelector('.module-name');
            if (nameElement) {
                nameElement.innerHTML = langData.modules[moduleId];
            }
        }
    });
    
    // 更新按钮文本
    updateButtonTexts(langData);
    
    // 更新信息面板
    updateInfoPanel(langData);
    
    // 更新操作提示
    updateOperationHints(langData);
    
    // 更新控制提示
    updateControlHint();
    
    // 更新方向提示
    updateOrientationHint();
    
    // 更新语言切换按钮状态
    updateLanguageSwitcher();
}

// 更新按钮文本
function updateButtonTexts(langData) {
    const buttonMappings = {
        'btn-start': 'startSimulation',
        'btn-stop': 'stopSimulation',
        'btn-reset': 'reset',
        'connections-toggle': showConnections ? 'hideConnections' : 'showConnections',
        'mode-toggle': connectionMode === 'curved' ? 'switchToOrthogonal' : 'switchToCurved',
        'anchor-toggle': document.getElementById('anchor-toggle')?.textContent.includes('显示') || 
                        document.getElementById('anchor-toggle')?.textContent.includes('Show') ? 'showAnchors' : 'hideAnchors'
    };
    
    // 查找所有按钮并更新文本
    const startBtn = document.querySelector('button[onclick="startSimulation()"]');
    if (startBtn) startBtn.textContent = langData.ui.startSimulation;
    
    const stopBtn = document.querySelector('button[onclick="stopSimulation()"]');
    if (stopBtn) stopBtn.textContent = langData.ui.stopSimulation;
    
    const resetBtn = document.querySelector('button[onclick="resetSimulation()"]');
    if (resetBtn) resetBtn.textContent = langData.ui.reset;
    
    const connectionsBtn = document.getElementById('connections-toggle');
    if (connectionsBtn) {
        connectionsBtn.textContent = showConnections ? langData.ui.hideConnections : langData.ui.showConnections;
    }
    
    const modeBtn = document.getElementById('mode-toggle');
    if (modeBtn) {
        modeBtn.textContent = connectionMode === 'curved' ? langData.ui.switchToOrthogonal : langData.ui.switchToCurved;
    }
    
    const anchorBtn = document.getElementById('anchor-toggle');
    if (anchorBtn) {
        const isShowing = anchorBtn.textContent.includes('隐藏') || anchorBtn.textContent.includes('Hide');
        anchorBtn.textContent = isShowing ? langData.ui.hideAnchors : langData.ui.showAnchors;
    }
    
    // 更新速度控制标签
    const speedLabels = document.querySelectorAll('.speed-control span');
    if (speedLabels[0]) speedLabels[0].textContent = langData.ui.simulationSpeed + ':';
    if (speedLabels[1]) speedLabels[1].textContent = langData.ui.flowSpeed + ':';
}

// 更新信息面板
function updateInfoPanel(langData) {
    const infoTitle = document.querySelector('.info-title');
    if (infoTitle) {
        infoTitle.textContent = langData.ui.currentActiveModule;
    }
    
    const infoContent = document.getElementById('current-info');
    if (infoContent && infoContent.textContent.includes('点击') || infoContent.textContent.includes('Click')) {
        infoContent.textContent = langData.ui.clickToStart;
    }
}

// 更新操作提示
function updateOperationHints(langData) {
    const hintPanel = document.querySelector('.connection-hint');
    if (hintPanel) {
        hintPanel.innerHTML = `
            <strong>${langData.ui.operationHints}</strong><br>
            ${langData.ui.dragModules}<br>
            ${langData.ui.autoUpdate}<br>
            ${langData.ui.toggleConnections}
        `;
    }
}

// 更新语言切换器状态
function updateLanguageSwitcher() {
    const languageButtons = document.querySelectorAll('.language-btn');
    languageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        }
    });
}

// 从本地存储加载语言偏好
function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && languages[savedLang]) {
        currentLanguage = savedLang;
    }
}

// 初始化语言系统
function initializeLanguageSystem() {
    loadLanguagePreference();
    
    // 创建语言切换器
    createLanguageSwitcher();
    
    // 创建屏幕方向提示
    createOrientationHint();
    
    // 初始化界面语言
    updateLanguageDisplay();
    
    // 添加控制提示
    setTimeout(() => {
        addControlHint();
    }, 100);
}

// 创建语言切换器
function createLanguageSwitcher() {
    const existingSwitcher = document.querySelector('.language-switcher');
    if (existingSwitcher) {
        existingSwitcher.remove();
    }
    
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    
    Object.keys(languages).forEach(langCode => {
        const lang = languages[langCode];
        const button = document.createElement('button');
        button.className = 'language-btn';
        button.dataset.lang = langCode;
        button.innerHTML = `${lang.flag} ${lang.name}`;
        button.onclick = () => switchLanguage(langCode);
        
        if (langCode === currentLanguage) {
            button.classList.add('active');
        }
        
        switcher.appendChild(button);
    });
    
    document.body.appendChild(switcher);
}

// 缩放功能
function initZoomControls() {
    // 创建缩放控制器
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    
    // 放大按钮
    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'zoom-btn';
    zoomInBtn.innerHTML = '+';
    zoomInBtn.title = 'Zoom In';
    zoomInBtn.onclick = () => zoomIn();
    
    // 缩放指示器
    const zoomIndicator = document.createElement('div');
    zoomIndicator.className = 'zoom-indicator';
    zoomIndicator.id = 'zoom-indicator';
    zoomIndicator.textContent = '100%';
    
    // 缩小按钮
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'zoom-btn';
    zoomOutBtn.innerHTML = '−';
    zoomOutBtn.title = 'Zoom Out';
    zoomOutBtn.onclick = () => zoomOut();
    
    // 重置按钮
    const zoomResetBtn = document.createElement('button');
    zoomResetBtn.className = 'zoom-btn';
    zoomResetBtn.innerHTML = '⌂';
    zoomResetBtn.title = 'Reset Zoom';
    zoomResetBtn.onclick = () => resetZoom();
    
    zoomControls.appendChild(zoomInBtn);
    zoomControls.appendChild(zoomIndicator);
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomResetBtn);
    
    document.body.appendChild(zoomControls);
}

// 缩放功能实现
function zoomIn() {
    if (currentZoom < 200) {
        currentZoom += 25;
        applyZoom();
    }
}

function zoomOut() {
    if (currentZoom > 50) {
        currentZoom -= 25;
        applyZoom();
    }
}

function resetZoom() {
    console.log('执行缩放重置...');
    resetZoomState();
}

// 重置缩放状态（修复累积错误）
function resetZoomState() {
    const container = document.querySelector('.container');
    const svg = document.getElementById('connections-svg');
    
    if (container && svg) {
        // 清除所有变换
        container.style.transform = '';
        svg.style.transform = '';
        
        // 重置缩放变量
        currentZoom = 100;
        autoResponsiveZoom = true;
        
        // 更新显示
        const indicator = document.getElementById('zoom-indicator');
        if (indicator) {
            indicator.textContent = '100%';
        }
        
        // 重新应用当前应该的缩放
        setTimeout(() => {
            handleResponsiveLayout();
            drawConnections();
        }, 100);
        
        console.log('缩放状态已重置');
    }
}

// 修改SVG同步函数：不缩放SVG
function syncSVGScale() {
    const container = document.querySelector('.container');
    const svg = document.getElementById('connections-svg');
    
    if (!container || !svg) {
        console.warn('容器或SVG元素未找到');
        return;
    }
    
    // 确保SVG不被缩放，保持原始坐标系统
    svg.style.transform = '';
    svg.style.transformOrigin = '';
    
    console.log('SVG保持原始大小，使用坐标补偿系统');
}

// 修改响应式处理函数，同步SVG缩放
function handleResponsiveLayout() {
    if (!autoResponsiveZoom) return;
    
    const width = window.innerWidth;
    const container = document.querySelector('.container');
    
    if (container) {
        // 移除所有缩放类
        container.className = container.className.replace(/zoom-\d+/g, '');
        
        // 根据屏幕宽度应用不同缩放
        if (width <= 600) {
            container.style.transform = 'scale(0.4)';
            currentZoom = 40;
        } else if (width <= 900) {
            container.style.transform = 'scale(0.55)';
            currentZoom = 55;
        } else if (width <= 1200) {
            container.style.transform = 'scale(0.7)';
            currentZoom = 70;
        } else if (width <= 1400) {
            container.style.transform = 'scale(0.85)';
            currentZoom = 85;
        } else {
            container.style.transform = 'scale(1)';
            currentZoom = 100;
        }
        
        // 同步SVG缩放
        syncSVGScale();
        
        // 更新缩放指示器
        const indicator = document.getElementById('zoom-indicator');
        if (indicator) {
            indicator.textContent = `${currentZoom}%`;
        }
    }
}

// 创建屏幕方向提示
function createOrientationHint() {
    const hint = document.createElement('div');
    hint.className = 'orientation-hint';
    hint.id = 'orientation-hint';
    
    const langData = languages[currentLanguage];
    hint.innerHTML = `
        <h3>📱 ${langData.ui.orientationTitle}</h3>
        <p>${langData.ui.orientationText}</p>
    `;
    
    document.body.appendChild(hint);
}

// 检查屏幕方向
function checkOrientation() {
    const hint = document.getElementById('orientation-hint');
    if (window.innerWidth < 900 && window.innerHeight > window.innerWidth) {
        // 竖屏且屏幕较小
        if (hint) {
            hint.classList.add('show');
        }
    } else {
        // 横屏或屏幕足够大
        if (hint) {
            hint.classList.remove('show');
        }
    }
}

// 添加控制提示
function addControlHint() {
    const controlPanel = document.querySelector('.control-panel');
    if (controlPanel) {
        // 检查是否已存在提示
        const existingHint = controlPanel.querySelector('.control-hint');
        if (!existingHint) {
            const hint = document.createElement('div');
            hint.className = 'control-hint';
            hint.id = 'control-hint';
            
            const langData = languages[currentLanguage];
            hint.textContent = langData.ui.controlHint;
            
            controlPanel.appendChild(hint);
        }
    }
}

// 更新控制提示文本
function updateControlHint() {
    const hint = document.getElementById('control-hint');
    if (hint) {
        const langData = languages[currentLanguage];
        hint.textContent = langData.ui.controlHint;
    }
}

// 更新方向提示文本
function updateOrientationHint() {
    const hint = document.getElementById('orientation-hint');
    if (hint) {
        const langData = languages[currentLanguage];
        hint.innerHTML = `
            <h3>📱 ${langData.ui.orientationTitle}</h3>
            <p>${langData.ui.orientationText}</p>
        `;
    }
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
    setTimeout(() => {
        drawConnections();
        handleResponsiveLayout();
        syncSVGScale();
        checkOrientation();
    }, 100);
});

// 监听方向变化
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        handleResponsiveLayout();
        syncSVGScale();
        checkOrientation();
        drawConnections();
    }, 300);
});

// 添加调试函数
function debugZoomState() {
    const container = document.querySelector('.container');
    const svg = document.getElementById('connections-svg');
    
    console.log('=== 缩放状态调试信息 ===');
    console.log('当前缩放比例:', currentZoom + '%');
    console.log('自动响应式:', autoResponsiveZoom);
    console.log('容器transform:', container ? container.style.transform : 'N/A');
    console.log('SVG transform:', svg ? svg.style.transform : 'N/A');
    
    if (container) {
        const computedStyle = window.getComputedStyle(container);
        console.log('容器计算后的transform:', computedStyle.transform);
    }
    
    console.log('========================');
    
    return {
        currentZoom,
        autoResponsiveZoom,
        containerTransform: container ? container.style.transform : null,
        svgTransform: svg ? svg.style.transform : null
    };
}

// 全局暴露调试函数（方便在控制台调用）
window.debugZoomState = debugZoomState;
window.resetZoomState = resetZoomState; 
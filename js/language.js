// ===========================================
// 多语言系统模块
// ===========================================

import { getCurrentLanguage, setCurrentLanguage, getShowConnections, getConnectionMode } from './config.js';

// 多语言数据
export const languages = {
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
            'needs': 'Needs & Motivation<br>欲求・動機システム',
            'planning': 'Planning System<br>計画システム',
            'relationship': 'Relationship Module<br>関係モジュール',
            'action-output': 'Action & Output<br>行動・出力モジュール',
            'environment': 'Environment Interaction<br>環境相互作用モジュール',
            'memory': 'Memory System<br>記憶システム',
            'global-time': 'Global Time System<br>グローバル時間システム'
        },
        descriptions: {
            'external-stimuli': '外部刺激：環境からの情報入力を受信',
            'perception': '知覚モジュール：入力情報を処理・解析',
            'ai-cognitive': 'AI認知コア：情報を統合し認知処理を実行',
            'thinking-core': '思考コア：深い思考と意思決定を実行',
            'personality': '性格モジュール：性格特性に基づいて応答を調整',
            'skills': 'スキルモジュール：関連スキルを適用して情報を処理',
            'needs': '欲求モジュール：欲求と動機を評価',
            'planning': '計画モジュール：行動計画を策定',
            'relationship': '関係モジュール：社会的関係要因を考慮',
            'action-output': '出力モジュール：最終応答を生成',
            'environment': '環境相互作用：外部環境との相互作用',
            'memory': '記憶システム：記憶情報の保存と取得',
            'global-time': '時間システム：システムタイミングの調整'
        },
        ui: {
            title: 'AI認知システム - 情報フローシミュレーター',
            startSimulation: 'シミュレーション開始',
            stopSimulation: 'シミュレーション停止',
            reset: 'リセット',
            hideConnections: '接続線を非表示',
            showConnections: '接続線を表示',
            switchToCurved: '曲線に切り替え',
            switchToOrthogonal: '直角に切り替え',
            showAnchors: 'アンカーポイントを表示',
            hideAnchors: 'アンカーポイントを非表示',
            simulationSpeed: 'シミュレーション速度',
            flowSpeed: 'フロー速度',
            currentActiveModule: '現在のアクティブモジュール',
            clickToStart: '「シミュレーション開始」をクリックして情報フローデモを開始',
            operationHints: '💡 操作ヒント：',
            dragModules: '• モジュールをドラッグして位置を変更',
            autoUpdate: '• 接続線は自動的に更新されます',
            toggleConnections: '• 接続線表示の切り替え',
            intelligentSystem: '🧠 インテリジェント接続システム：',
            smartAnchors: '• スマートアンカー：最適な接続ポイントを自動選択',
            dualModes: '• 曲線/直角デュアル接続モード',
            realTimeUpdate: '• モジュールをドラッグしてリアルタイム接続更新',
            debugMode: '• アンカーポイント可視化デバッグをサポート',
            controlHint: 'シミュレーション停止時にモジュールをドラッグ',
            orientationTitle: '横画面表示を推奨',
            orientationText: '最適な体験のため、デバイスを横向きに回転してください'
        }
    }
};

// 语言切换函数
export function switchLanguage(lang) {
    if (!languages[lang]) {
        console.warn(`Language ${lang} not supported`);
        return;
    }
    
    setCurrentLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    updateLanguageDisplay();
    
    // 更新当前活动模块的描述
    updateCurrentActiveModuleInfo();
}

// 更新语言显示
export function updateLanguageDisplay() {
    const langData = languages[getCurrentLanguage()];
    if (!langData) return;
    
    updateModuleTexts(langData);
    updateButtonTexts(langData);
    updateInfoPanel(langData);
    updateOperationHints(langData);
    updateOrientationHint(langData);
    updateLanguageSwitcher();
}

// 更新模块文本
function updateModuleTexts(langData) {
    Object.keys(langData.modules).forEach(moduleId => {
        const module = document.getElementById(moduleId);
        if (module) {
            const nameElement = module.querySelector('.module-name');
            if (nameElement) {
                nameElement.innerHTML = langData.modules[moduleId];
            }
        }
    });
}

// 更新按钮文本
function updateButtonTexts(langData) {
    const buttonMappings = {
        'start-btn': 'startSimulation',
        'stop-btn': 'stopSimulation',
        'reset-btn': 'reset',
        'connections-toggle': getShowConnections() ? 'hideConnections' : 'showConnections',
        'mode-toggle': getConnectionMode() === 'curved' ? 'switchToOrthogonal' : 'switchToCurved',
        'anchors-toggle': 'showAnchors' // 这个需要动态判断
    };
    
    Object.entries(buttonMappings).forEach(([id, textKey]) => {
        const button = document.getElementById(id);
        if (button && langData.ui[textKey]) {
            button.textContent = langData.ui[textKey];
        }
    });
    
    // 更新标题
    const title = document.querySelector('.system-title h1');
    if (title && langData.ui.title) {
        title.textContent = langData.ui.title;
    }
    
    // 更新速度标签
    const speedLabels = document.querySelectorAll('.speed-control span');
    speedLabels.forEach((label, index) => {
        if (index === 0 && langData.ui.simulationSpeed) {
            label.textContent = langData.ui.simulationSpeed + ':';
        } else if (index === 1 && langData.ui.flowSpeed) {
            label.textContent = langData.ui.flowSpeed + ':';
        }
    });
}

// 更新信息面板
function updateInfoPanel(langData) {
    const infoTitle = document.querySelector('.info-title');
    const infoContent = document.getElementById('current-info');
    
    if (infoTitle && langData.ui.currentActiveModule) {
        infoTitle.textContent = langData.ui.currentActiveModule;
    }
    
    if (infoContent && langData.ui.clickToStart) {
        infoContent.textContent = langData.ui.clickToStart;
    }
}

// 更新操作提示
function updateOperationHints(langData) {
    const hintElement = document.querySelector('.connection-hint');
    if (hintElement && langData.ui) {
        hintElement.innerHTML = `
            <strong>${langData.ui.operationHints}</strong><br>
            ${langData.ui.dragModules}<br>
            ${langData.ui.autoUpdate}<br>
            ${langData.ui.toggleConnections}<br><br>
            <strong>${langData.ui.intelligentSystem}</strong><br>
            ${langData.ui.smartAnchors}<br>
            ${langData.ui.dualModes}<br>
            ${langData.ui.realTimeUpdate}<br>
            ${langData.ui.debugMode}
        `;
    }
}

// 更新方向提示
function updateOrientationHint(langData) {
    const hint = document.getElementById('orientation-hint');
    if (hint && langData.ui) {
        hint.innerHTML = `
            <h3>📱 ${langData.ui.orientationTitle}</h3>
            <p>${langData.ui.orientationText}</p>
        `;
    }
}

// 更新语言切换器
function updateLanguageSwitcher() {
    const buttons = document.querySelectorAll('.language-switcher button');
    buttons.forEach(button => {
        const lang = button.getAttribute('data-lang');
        if (lang) {
            if (lang === getCurrentLanguage()) {
                button.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
                button.style.color = 'white';
            } else {
                button.style.background = 'rgba(52, 152, 219, 0.1)';
                button.style.color = '#2c3e50';
            }
        }
    });
}

// 加载语言偏好
export function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && languages[savedLang]) {
        setCurrentLanguage(savedLang);
    }
    return getCurrentLanguage();
}

// 初始化语言系统
export function initializeLanguageSystem() {
    loadLanguagePreference();
    createLanguageSwitcher();
    updateLanguageDisplay();
}

// 创建语言切换器
function createLanguageSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.style.cssText = `
        position: fixed; top: 20px; right: 20px; display: flex; gap: 8px; z-index: 200;
        background: rgba(255,255,255,0.95); padding: 10px; border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1); backdrop-filter: blur(10px);
    `;
    
    Object.keys(languages).forEach(langCode => {
        const lang = languages[langCode];
        const button = document.createElement('button');
        button.setAttribute('data-lang', langCode);
        button.style.cssText = `
            padding: 8px 12px; border: none; border-radius: 10px; font-size: 11px;
            cursor: pointer; transition: all 0.3s ease; min-width: 80px; text-align: center;
        `;
        button.innerHTML = `${lang.flag} ${lang.name}`;
        button.onclick = () => switchLanguage(langCode);
        switcher.appendChild(button);
    });
    
    document.body.appendChild(switcher);
}

// 更新当前活动模块信息
function updateCurrentActiveModuleInfo() {
    const activeModule = document.querySelector('.module.active');
    if (activeModule) {
        const moduleId = activeModule.id;
        const currentLang = getCurrentLanguage();
        const langData = languages[currentLang];
        
        // 更新活动模块的描述信息
        if (langData && langData.descriptions && langData.descriptions[moduleId]) {
            const infoElement = document.getElementById('current-info');
            if (infoElement) {
                infoElement.textContent = langData.descriptions[moduleId];
            }
        }
    } else {
        // 如果没有活动模块，显示默认提示文本
        const currentLang = getCurrentLanguage();
        const langData = languages[currentLang];
        const infoElement = document.getElementById('current-info');
        
        if (infoElement && langData && langData.ui && langData.ui.clickToStart) {
            infoElement.textContent = langData.ui.clickToStart;
        }
    }
} 
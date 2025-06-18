// ===========================================
// 模拟系统模块
// ===========================================

import { 
    isRunning,
    getCurrentTimeout,
    getSpeed,
    setIsRunning,
    setCurrentTimeout,
    flowSequence,
    getCurrentLanguage
} from './config.js';

import { animateConnectionFlow, stopAllFlowAnimations, animateModuleActivation } from './animation.js';
import { connections } from './config.js';
import { languages } from './language.js';

// 启动模拟
export function startSimulation() {
    if (isRunning()) {
        console.log('模拟已在运行中');
        return;
    }
    
    setIsRunning(true);
    let currentIndex = 0;
    
    console.log('🚀 开始模拟...');
    
    function nextStep() {
        if (!isRunning()) return;
        
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
            }, getSpeed() * 0.7); // 在切换前开始流动动画
        }
        
        currentIndex = nextIndex;
        const timeout = setTimeout(nextStep, getSpeed());
        setCurrentTimeout(timeout);
    }
    
    nextStep();
}

// 停止模拟
export function stopSimulation() {
    if (!isRunning()) {
        console.log('模拟未在运行');
        return;
    }
    
    setIsRunning(false);
    const timeout = getCurrentTimeout();
    if (timeout) {
        clearTimeout(timeout);
        setCurrentTimeout(null);
    }
    
    stopAllFlowAnimations();
    console.log('⏹️ 模拟已停止');
}

// 重置模拟
export function resetSimulation() {
    console.log('🔄 重置模拟...');
    
    stopSimulation();
    
    // 清除所有活动状态
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    
    document.querySelectorAll('.connection-line').forEach(line => {
        line.classList.remove('active');
    });
    
    // 重置信息显示 - 使用多语言
    const currentLang = getCurrentLanguage();
    const langData = languages[currentLang];
    const resetText = langData?.ui?.clickToStart || '点击"开始模拟"按钮开始信息传导演示';
    updateInfo(resetText);
    
    console.log('✅ 模拟已重置');
}

// 激活模块
export function activateModule(moduleId) {
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
        // 使用动画系统的激活动画
        animateModuleActivation(moduleId);
        
        // 获取当前语言的模块描述
        const moduleDescription = getModuleDescription(moduleId);
        updateInfo(moduleDescription);
        
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
    } else {
        console.warn(`模块 ${moduleId} 未找到`);
    }
}

// 获取模块描述（多语言支持）
function getModuleDescription(moduleId) {
    const currentLang = getCurrentLanguage();
    const langData = languages[currentLang];
    
    if (langData && langData.descriptions && langData.descriptions[moduleId]) {
        return langData.descriptions[moduleId];
    }
    
    // 降级到默认语言（简体中文）
    const defaultLangData = languages['zh-CN'];
    if (defaultLangData && defaultLangData.descriptions && defaultLangData.descriptions[moduleId]) {
        return defaultLangData.descriptions[moduleId];
    }
    
    return '未知模块';
}

// 更新信息显示
export function updateInfo(text) {
    const infoElement = document.getElementById('current-info');
    if (infoElement) {
        infoElement.textContent = text;
    }
}

// 设置模拟速度
export function setSimulationSpeed(newSpeed) {
    import('./config.js').then(({ setSpeed }) => {
        setSpeed(newSpeed);
        console.log('模拟速度已设置为:', newSpeed + 'ms');
    });
}

// 获取模拟状态
export function getSimulationStatus() {
    return {
        isRunning: isRunning(),
        speed: getSpeed(),
        currentTimeout: getCurrentTimeout()
    };
}

// 单步执行模拟
export function stepSimulation() {
    if (isRunning()) {
        console.warn('请先停止当前模拟');
        return;
    }
    
    // 找到当前活动模块
    const activeModule = document.querySelector('.module.active');
    let currentIndex = 0;
    
    if (activeModule) {
        const moduleId = activeModule.id;
        currentIndex = flowSequence.indexOf(moduleId);
        if (currentIndex === -1) currentIndex = 0;
    }
    
    // 激活下一个模块
    const nextIndex = (currentIndex + 1) % flowSequence.length;
    const nextModuleId = flowSequence[nextIndex];
    
    activateModule(nextModuleId);
    console.log(`单步执行: 激活模块 ${nextModuleId}`);
}

// 跳转到指定模块
export function jumpToModule(moduleId) {
    if (isRunning()) {
        console.warn('请先停止当前模拟');
        return;
    }
    
    if (!flowSequence.includes(moduleId)) {
        console.error(`模块 ${moduleId} 不在流程序列中`);
        return;
    }
    
    activateModule(moduleId);
    console.log(`跳转到模块: ${moduleId}`);
} 
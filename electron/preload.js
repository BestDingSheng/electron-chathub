const { contextBridge, ipcRenderer } = require('electron')

// 暴露受保护的方法，允许渲染器进程使用
// 而不暴露整个 ipcRenderer
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  
  // 检查是否在 Electron 环境中运行
  isElectron: () => ipcRenderer.invoke('is-electron'),
  
  // 平台信息
  platform: process.platform,
  
  // 服务窗口管理
  createServiceWindow: (serviceId, serviceName, serviceUrl) => 
    ipcRenderer.invoke('create-service-window', serviceId, serviceName, serviceUrl),
  closeServiceWindow: (serviceId) => 
    ipcRenderer.invoke('close-service-window', serviceId),
  getOpenServiceWindows: () => 
    ipcRenderer.invoke('get-open-service-windows'),
  
  // 窗口控制（如果需要的话）
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // 应用控制
  quit: () => ipcRenderer.invoke('app-quit'),
  
  // 主题相关
  onThemeChange: (callback) => {
    ipcRenderer.on('theme-changed', callback)
  },
  
  // 移除监听器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  }
})

// 确保在页面加载时 Electron API 可用
window.addEventListener('DOMContentLoaded', () => {
  // 可以在这里添加一些初始化逻辑
  console.log('Electron preload script loaded')
})
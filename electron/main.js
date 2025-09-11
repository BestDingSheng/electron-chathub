const { app, BrowserWindow, Menu, shell, ipcMain, session } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

// 只在生产环境中导入 electron-updater
let autoUpdater
if (!isDev) {
  try {
    autoUpdater = require('electron-updater').autoUpdater
  } catch (error) {
    console.log('electron-updater not available:', error.message)
  }
}

// 保持对窗口对象的全局引用，如果你不这样做，当 JavaScript 对象被垃圾回收时，窗口会被自动关闭
let mainWindow
const serviceWindows = new Map() // 存储独立服务窗口

// 设置网络拦截来移除阻止iframe的响应头
function setupNetworkInterception() {
  const filter = {
    urls: ['*://*/*']
  }

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    const responseHeaders = { ...details.responseHeaders }
    
    // 移除阻止iframe嵌入的响应头
    if (responseHeaders['x-frame-options']) {
      delete responseHeaders['x-frame-options']
    }
    if (responseHeaders['X-Frame-Options']) {
      delete responseHeaders['X-Frame-Options']
    }
    
    // 修改Content-Security-Policy，移除frame-ancestors限制
    if (responseHeaders['content-security-policy']) {
      responseHeaders['content-security-policy'] = responseHeaders['content-security-policy'].map(header => {
        return header.replace(/frame-ancestors[^;]*;?/gi, '')
      })
    }
    if (responseHeaders['Content-Security-Policy']) {
      responseHeaders['Content-Security-Policy'] = responseHeaders['Content-Security-Policy'].map(header => {
        return header.replace(/frame-ancestors[^;]*;?/gi, '')
      })
    }
    
    callback({ responseHeaders })
  })
}

// 创建独立的服务窗口
function createServiceWindow(serviceId, serviceName, serviceUrl) {
  // 如果窗口已存在，聚焦到该窗口
  if (serviceWindows.has(serviceId)) {
    const existingWindow = serviceWindows.get(serviceId)
    if (!existingWindow.isDestroyed()) {
      existingWindow.focus()
      return existingWindow.id
    } else {
      serviceWindows.delete(serviceId)
    }
  }

  const serviceWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: serviceName,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  })

  serviceWindow.once('ready-to-show', () => {
    serviceWindow.show()
  })

  serviceWindow.loadURL(serviceUrl)

  // 处理外部链接
  serviceWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 当窗口关闭时从Map中移除
  serviceWindow.on('closed', () => {
    serviceWindows.delete(serviceId)
  })

  serviceWindows.set(serviceId, serviceWindow)
  return serviceWindow.id
}

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../public/icon.png'), // 你需要添加应用图标
    show: false, // 初始隐藏，等加载完成后显示
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // 允许加载外部资源，用于 iframe
    }
  })

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // 开发环境下打开开发者工具
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  // 加载应用
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`
  
  mainWindow.loadURL(startUrl)

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 当 window 被关闭，这个事件会被触发
  mainWindow.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，通常会把多个 window 对象存放在一个数组里面，与此同时，你应该删除相应的元素。
    mainWindow = null
  })

  // 阻止新窗口打开
  mainWindow.webContents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
    shell.openExternal(navigationUrl)
  })
}

// Electron 会在初始化后并准备创建浏览器窗口时，调用这个函数
app.on('ready', () => {
  // 首先设置网络拦截
  setupNetworkInterception()
  
  createWindow()
  
  // 设置应用菜单
  createMenu()
  
  // 检查更新（生产环境）
  if (!isDev && autoUpdater) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

// 当全部窗口关闭时退出
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，否则绝大部分应用会保持激活
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在 macOS 上，当点击 dock 中的应用图标时，如果没有其他窗口打开，则重新创建一个窗口
  if (mainWindow === null) {
    createWindow()
  }
})

// 创建应用菜单
function createMenu() {
  const template = [
    {
      label: 'AI 服务管理器',
      submenu: [
        {
          label: '关于',
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '查看',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { label: '最小化', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: '关闭', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC 处理程序
ipcMain.handle('app-version', () => {
  return app.getVersion()
})

ipcMain.handle('is-electron', () => {
  return true
})

// 处理创建服务窗口的请求
ipcMain.handle('create-service-window', (event, serviceId, serviceName, serviceUrl) => {
  return createServiceWindow(serviceId, serviceName, serviceUrl)
})

// 处理关闭服务窗口的请求
ipcMain.handle('close-service-window', (event, serviceId) => {
  const window = serviceWindows.get(serviceId)
  if (window && !window.isDestroyed()) {
    window.close()
    return true
  }
  return false
})

// 获取所有打开的服务窗口
ipcMain.handle('get-open-service-windows', () => {
  const openWindows = []
  for (const [serviceId, window] of serviceWindows.entries()) {
    if (!window.isDestroyed()) {
      openWindows.push(serviceId)
    } else {
      serviceWindows.delete(serviceId)
    }
  }
  return openWindows
})

// 处理应用更新
if (!isDev && autoUpdater) {
  autoUpdater.on('update-available', () => {
    console.log('Update available')
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded')
    autoUpdater.quitAndInstall()
  })
}
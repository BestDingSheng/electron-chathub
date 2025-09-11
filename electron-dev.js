const { app, BrowserWindow, shell, ipcMain, session } = require('electron')
const path = require('path')

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
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'electron/preload.js'),
      webSecurity: false,
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // 开发环境自动打开开发者工具
    mainWindow.webContents.openDevTools()
  })

  // 开发环境连接到 Next.js 开发服务器
  // 从环境变量获取端口，默认使用 3000
  const port = process.env.PORT || process.env.NEXT_PORT || 3000
  const startUrl = `http://localhost:${port}`
  
  console.log(`Loading from: ${startUrl}`)
  mainWindow.loadURL(startUrl)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  // 首先设置网络拦截
  setupNetworkInterception()
  
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

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
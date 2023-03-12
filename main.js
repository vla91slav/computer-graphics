const path = require('path')
const url = require('url')
const { app, BrowserWindow, Menu, ipcMain } = require('electron')

function createWindow() {
    win = new BrowserWindow({
        width: 1500,
        height: 970,
        minWidth: 1500,
        minHeight: 970,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, './renderer/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.webContents.openDevTools()
    win.on('closed', () => {
        win = null
    })
}

function createHelpWindow() {
    win = new BrowserWindow({
        width: 1250,
        height: 950,
        minWidth: 1250,
        minHeight: 950,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, './renderer/help.html'),
        protocol: 'file:',
        slashes: true
    }))

    win.webContents.openDevTools()
    win.on('closed', () => {
        win = null
    })
}

app.whenReady().then(() => {
    createWindow()
})

ipcMain.on('open-help-window', () => {
    createHelpWindow()
})

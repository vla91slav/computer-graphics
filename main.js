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

function createToolbarWindow(link, w, h)
{
    win = new BrowserWindow({
        width: w,
        height: h,
        minWidth: 400,
        minHeight: 200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, link),
        protocol: 'file:',
        slashes: true,
        frame: false
    }))
    win.setMenuBarVisibility(false)
    win.on('closed', () => {
        win = null
    })
}

function checkIfOpened() {
    const windows = BrowserWindow.getAllWindows()
    if (windows.length > 1) {
        windows[0].focus()
        return false
    }
    return true
}

app.on('ready', () => {
    createWindow()
    const template = [
        {
            label: 'Помощь',
            click: () =>
            {
                if (checkIfOpened())
                    createToolbarWindow('./renderer/help.html', 400, 1000)
            }
        },
        {
            label: 'Условие',
            click: () => {
                if (checkIfOpened())
                    createToolbarWindow('./renderer/task.html', 400, 200)
            }
        },
        {
            label: 'Справка',
            click: () => {
                if (checkIfOpened())
                    createToolbarWindow('./renderer/info.html', 400, 250)
            }
        }
    ]
    const mactemplate = [
        {
            label: 'tmp'
        },
        {
            label: 'Информация',
            submenu: [
                {
                    label: 'Условие',
                    click: () => {
                        if (checkIfOpened())
                            createToolbarWindow('task.html', 400, 200)
                    }
                },
                {
                    label: 'Помощь',
                    click: () => {
                        if (checkIfOpened())
                            createToolbarWindow('help.html', 400, 1000)
                    }
                },
                {
                    label: 'Справка',
                    click: () => {
                        if (checkIfOpened())
                            createToolbarWindow('info.html', 400, 250)
                    }
                }
            ]
        }
    ]
    let menu
    if (process.platform == 'darwin') {
        menu = Menu.buildFromTemplate(mactemplate)
    } else {
        menu = Menu.buildFromTemplate(template)
    }
    Menu.setApplicationMenu(menu)
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})
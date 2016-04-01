'use strict'

const electron = require('electron');
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const clipboard = require('clipboard')
const Tray = electron.Tray

const ipcMain = require('electron').ipcMain

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let url

let fetch = require('node-fetch')

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600})

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html')

    // Open the DevTools.
    //mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    url = clipboard.readText()
    //let tray = new Tray('./electron-icon.png')
    //tray.popUpContextMenu()
    //console.log(Notification)
    /*var myNotification = new Notification('Title', {
     body: 'Lorem Ipsum Dolor Sit Amet'
     })*/
    setInterval(function () {
        checkIfUrlCopied()
    }, 1000)
}

function checkIfUrlCopied() {
    console.log('Clipboard: ' + clipboard.readText())
    console.log('url = ' + url)
    if (url != clipboard.readText()) {
        url = clipboard.readText()
        if (validateUrl(url)) {
            console.log(mainWindow)
            console.log('Clipboard has a valid URL!')

            let options = {
                method: 'POST',
                body: 'url=' + url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }

            fetch('http://franciskim.co:3007/unfluff', options)
                .then(function (res) {
                    return res.json()
                }).then(function (json) {
                    mainWindow.webContents.send('summary', json)
                    if (settingsPopup) mainWindow.show()
                })
        }
    }
}

function validateUrl(textval) {
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
    return urlregex.test(textval)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

var settingsPopup = false
ipcMain.on('settings-popup', function (event, arg) {
    settingsPopup = arg
})
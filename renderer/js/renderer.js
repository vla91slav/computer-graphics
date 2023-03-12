const path = require('path')
const url = require('url')
const { app, ipcRenderer } = require('electron')

const testBtn = document.getElementById('window')

// testBtn.addEventListener('click', () => {
//     ipcRenderer.send('open-help-window')
// })
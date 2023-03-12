const path = require('path')
const url = require('url')
const { app, ipcRenderer } = require('electron')

const testBtn = document.getElementById('test')

testBtn.addEventListener('click', () => {
    console.log('123')
})
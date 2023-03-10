const path = require('path')
const url = require('url')
const { app } = require('electron')

const remote = require('@electron/remote');
const { parse } = require('path');
const { BrowserWindow } = remote

let statuses = []
let actual

// кнопки
const addBtn = document.getElementById('add')
const delBtn = document.getElementById('del')
const delAllBtn = document.getElementById('delete-all')
const execBtn = document.getElementById('execute')
const addLineBtn = document.getElementById('add-line')

const okBtn = document.getElementById('ok-button')
console.log(addBtn, okBtn)

// кнопки подтверждения
const yesBtn = document.getElementById('yes')
const noBtn = document.getElementById('no')

// координаты
const xLabel = document.getElementById('xinput')
const yLabel = document.getElementById('yinput')

// таблицы
global.allDots = document.getElementById('text-area-1')
global.allLines = document.getElementById('text-area-2')
const resultArea = document.getElementById('result')

const dotIndex = document.getElementById('dotinput')
const modeBtn = document.getElementById('mode')
const canvas = document.getElementById('myChart')

global.drawMode = 0

let tempData = []

function saveStatus(stack=1, eventMode=0) {
    if (!stack) {
        actual  = [{
            xLabel: xLabel.value,
            yLabel: yLabel.value,
            xPlaceholder: xLabel.placeholder,
            yPlaceholder: yLabel.placeholder,
            addLineText: addLineBtn.textContent,
            allDots: allDots.value,
            allLines: allLines.value,
            resultArea: resultArea.value,
            data: window.chartData.datasets.slice(),
            drawMode: drawMode,
            tempData: tempData,
            dotIndex: dotIndex.value
        }]
    } else {
        statuses.push({
            event: eventMode,
            xLabel: xLabel.value,
            yLabel: yLabel.value,
            xPlaceholder: xLabel.placeholder,
            yPlaceholder: yLabel.placeholder,
            addLineText: addLineBtn.textContent,
            allDots: allDots.value,
            allLines: allLines.value,
            resultArea: resultArea.value,
            data: window.chartData.datasets.slice(),
            drawMode: drawMode,
            tempData: tempData,
            dotIndex: dotIndex.value
        })
    }
}

function isNumeric(str) {
    if (typeof str != "string") return false 
    return !isNaN(str)
}

function setDefault() {
    xLabel.placeholder = 'пример: 12.123'
    yLabel.placeholder = 'пример: 906'
    addLineBtn.textContent = 'Добавить прямую (0/2)'
}

function clearDotLabels() {
    xLabel.value = ""
    yLabel.value = ""
}

function addDot() {
    resultArea.value = ''
    if (tempData) tempData = []
    setDefault()

    let x = xLabel.value
    let y = yLabel.value
    if (!isNumeric(x) || !isNumeric(y) || !x || !y) {
        clearDotLabels()
        // createErrorWindow()
        alert('Ошибка ввода точки')
        return
    }

    saveStatus()

    x = parseFloat(x)
    y = parseFloat(y)
    let allData = window.chartData.datasets
    for (let i = 0; i < allData.length; i++) {
        if (allData[i].data.length == 1 && x == allData[i].data[0].x && y == allData[i].data[0].y) {
            clearDotLabels()
            // createErrorWindow()
            alert('Ошибка ввода точки')
            return
        }
    }
    window.chartData.datasets.push({
        label: 'Dot ' + window.nextDatasetId++,
        data: [{ x, y }],
        backgroundColor: `hsl(${window.nextDatasetId * 50}, 50%, 50%)`
    })
    window.chart.update()
    window.chart.resetZoom()
    clearDotLabels()

    x = x.toFixed(3)
    y = y.toFixed(3)

    if (!allDots.value) {
        allDots.value = `${window.nextDatasetId - 1}) ${x}, ${y}`
    } else {
        allDots.value = allDots.value + "\n" + `${window.nextDatasetId - 1}) ${x}, ${y}`
    }
    saveStatus(stack=0)
}

function getEquation(data) {
    let x1 = data[0].x
    let x2 = data[1].x

    let y1 = data[0].y
    let y2 = data[1].y

    let k = (y1 - y2) / (x1 - x2)
    let b = y2 - k * x2
    k = k.toFixed(1)
    b = b.toFixed(1)
    console.log(k, b)
    let equation
    if (k == 'Infinity' || k == 'NaN' || b == 'Infinity' || b == 'NaN') {
        k = x1
        b = 0
        equation = `x = ${k}${b > 0 ? ' + ' : ' - '}${Math.abs(b)}`
    } else {
        equation = `y = ${k}x${b > 0 ? ' + ' : ' - '}${Math.abs(b)}`
    }
    return equation
}

function addLine() {
    resultArea.value = ''
    let x = xLabel.value
    let y = yLabel.value
    let result
    if (!isNumeric(x) || !isNumeric(y) || !x || !y) {
        setDefault()
        clearDotLabels()
        // createErrorWindow()
        alert('Ошибка ввода прямой')
        return
    }
    tempData.push({x, y})

    if (tempData.length === 2) {
        if (tempData[0].x == tempData[1].x && tempData[0].y == tempData[1].y) {
            saveStatus()
            tempData = []
            setDefault()
            clearDotLabels()
            // createErrorWindow()
            alert('Ошибка ввода прямой')
            return
        }
        saveStatus()
        window.chartData.datasets.push({
            label: 'Line ' + window.nextDatasetId++,
            type: 'line',
            data: tempData,
            backgroundColor: `hsl(${window.nextDatasetId * 50}, 50%, 50%)`,
            borderColor: 'black',
            borderWidth: 1,
            showLine: true
        })
        window.chart.update()
        window.chart.resetZoom()
        result = getEquation(tempData)
        tempData = []
        setDefault()
    } else {
        saveStatus()
        xLabel.placeholder = 'Ожидание ввода второй'
        yLabel.placeholder = 'для построения прямой'
        addLineBtn.textContent = 'Добавить прямую (1/2)'
    }

    clearDotLabels()

    if (!allLines.value && tempData.length == 0) {
        allLines.value = `${window.nextDatasetId - 1}) ${result}`
    } else if (allLines.value && tempData.length == 0) {
        allLines.value = allLines.value + "\n" + `${window.nextDatasetId - 1}) ${result}`
    }
    saveStatus(stack=0)
}

function deleteData()
{
    resultArea.value = ''
    let allData = window.chartData.datasets
    let index = dotIndex.value
    if (!isNumeric(index) || !index || !Number.isInteger(parseFloat(index))) {
        dotIndex.value = ""
        // createErrorWindow()
        alert('Ошибка удаления')
        return
    }
    index = parseInt(index)
    if (index < 0) {
        dotIndex.value = ""
        // createErrorWindow()
        alert('Ошибка удаления')
        return
    }
    saveStatus()
    for (let i = 0; i < allData.length; i++) {
        let dataIndex = allData[i].label.match(/\d+/g).map(Number)
        if (dataIndex.length != 0 && parseInt(dataIndex[0]) == index) {
            index = i
            allData.splice(index, 1)
            window.chart.update()
            updateLists(save=0)
            break
        }
    }
    dotIndex.value = ''
}

function updateLists(save=1) {
    let allData = window.chartData.datasets
    let result
    let data
    if (save) saveStatus()
    allDots.value = ""
    allLines.value = ""
    for (let i = 0; i < allData.length; i++) {
        let index = allData[i].label.match(/\d+/g).map(Number)[0]
        if (allData[i].label.includes('Dot')) {
            allDots.value = !allDots.value ? `${index}) ${allData[i].data[0].x.toFixed(3)}, ${allData[i].data[0].y.toFixed(3)}` : allDots.value + "\n" + `${index}) ${allData[i].data[0].x.toFixed(3)}, ${allData[i].data[0].y.toFixed(3)}`
        } else {
            data = []
            data.push(allData[i].data[0])
            data.push(allData[i].data[1])
            result = getEquation(data)
            allLines.value = !allLines.value ? `${index}) ${result}` : allLines.value + "\n" + `${index}) ${result}`
        }
    }
}

function createAlertWindow()
{
    win = new BrowserWindow({width: 400, height: 200})
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'alert.html'),
        protocol: 'file:',
        slashes: true,
        frame: false
    }))
    win.setMenuBarVisibility(false)
    win.on('closed', () => {
        win = null
    })
}

function createErrorWindow()
{
    win = new BrowserWindow({width: 400, height: 200})
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'alert.html'),
        protocol: 'file:',
        slashes: true,
        frame: false
    }))
    win.setMenuBarVisibility(false)
    win.on('closed', () => {
        win = null
    })
}

function outputResult(res) {
    saveStatus()
    if (res.length == 0) {
        resultArea.value = 'Решение отсутствует'
    } else {
        resultArea.value = `Найдены следующие точки:\nx1 = ${res[0].x.toFixed(3)}, y1 = ${res[0].y.toFixed(3)}\nx2 = ${res[1].x.toFixed(3)}, y2 = ${res[1].y.toFixed(3)}\nУравнение прямой: ${getEquation(res)}`
    }
}

function solution() {
    let allData = window.chartData.datasets
    let A = []
    let B = []

    for (let i = 0; i < allData.length; i++) {
        if (allData[i].data.length == 1) 
            A.push(allData[i].data[0])
        else 
            B.push({p1: allData[i].data[0], p2: allData[i].data[1]})
    }
    // A = [{x: -10, y: -10}, {x: 10, y: 10}, {x: 10, y: 0}, {x: -10, y: 0}]
    // B = [{p1: {x: 0, y: 0}, p2: {x: 1, y: 1}}]

    let maxCount = 0
    let maxPoints = []

    for (let i = 0; i < A.length; i++) {
        for (let j = i + 1; j < A.length; j++) {
            let count = 0
            let slope = (A[j].y - A[i].y) / (A[j].x - A[i].x);
            
            for (let k = 0; k < B.length; k++) {
                let lineSlope = (B[k].p2.y - B[k].p1.y) / (B[k].p2.x - B[k].p1.x);
                if (lineSlope === slope) {
                    count++
                }
            }
            
            if (count > maxCount) {
                maxCount = count
                maxPoints = [A[i], A[j]]
            }
        }
    }
    // if (B.length == 0) {
    //     maxPoints = [A[0], A[1]]
    // }

    // if (maxPoints.length == 0) {
    //     outputResult([])
    //     return
    // }
    // let x1 = maxPoints[0].x
    // let x2 = maxPoints[1].x

    // let y1 = maxPoints[0].y
    // let y2 = maxPoints[1].y

    // let k = (y1 - y2) / (x1 - x2)
    // let b = y2 - k * x2

    // let above = 0
    // let bottom = 0

    // for (let i = 0; i < A.length; i++) {
    //     let func = k * A[i].x + b
    //     if (func > A[i].y)
    //         above++
    //     else if (func < A[i].y)
    //         bottom++
    // }
    // console.log('maxPoints', maxPoints)
    // if (above == bottom)
    //     outputResult(maxPoints)
    // else
    //     outputResult([])
    if (B.length == 0) {
        maxPoints = A
    }
    if (maxPoints.length == 0) {
        outputResult([])
        return
    }
    let result = []
    let maxx
    for (let i = 0; i < maxPoints.length - 1; i += 2) {
        console.log('max', maxPoints)
        let x1 = maxPoints[i].x
        let x2 = maxPoints[i + 1].x
    
        let y1 = maxPoints[i].y
        let y2 = maxPoints[i + 1].y

        let k = (y1 - y2) / (x1 - x2)
        let b = y2 - k * x2

        let above = 0
        let bottom = 0
    
        for (let i = 0; i < A.length; i++) {
            let func = k * A[i].x + b
            if (func > A[i].y)
                above++
            else if (func < A[i].y)
                bottom++
        }
        console.log(above, bottom)
        if (above == bottom) {
            if (result.length == 0) {
                result.push({'x': x1, 'y': y1})
                result.push({'x': x2, 'y': y2})
                
                maxx = above
            }
            if (above > maxx) {
                maxx = above
                result.push({x: x1, y: y1})
                result.push({x: x2, y: y2})
            }
        }
    }
    if (B.length == 0 && A.length == 2)
        result = [A[0], A[1]]
    // console.log('res', result)
    outputResult(result)
}

addBtn.addEventListener('click', () => {
    addDot()
})

delBtn.addEventListener('click', () => {
    deleteData()
})

execBtn.addEventListener('click', () => {
    resultArea.value = ''
    console.log('solution')
    solution()
})

delAllBtn.addEventListener('click', () => {
    // createAlertWindow()
    saveStatus()
    window.nextDatasetId = 0
    window.chartData.datasets = []
    setDefault()
    clearDotLabels()
    allDots.value = ''
    allLines.value = ''
    resultArea.value = ''
    window.chart.update()
})

addLineBtn.addEventListener('click', () => {
    addLine()
})

modeBtn.addEventListener('click', () => {
    if (drawMode == 0) {
        modeBtn.textContent = "Режим: прямые"
        drawMode = 1
    } else {
        modeBtn.textContent = "Режим: точки"
        drawMode = 0
    }
})

canvas.addEventListener('mousedown', (event) => {
    if (event.button == 0)
        saveStatus()
    setTimeout(() => {
        if (event.button == 2 && window.success) {
            console.log(statuses)
            saveStatus(eventMode=1)
            window.success = 0
            updateLists(save=0)
            console.log(statuses)
        } else if (event.button == 0 && drawMode) {
            updateLists(save=0)
            saveStatus(stack=0)
        } else if (event.button == 0 && !drawMode) {
            saveStatus(stack=0)
        }
    }, 100)
})

document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        if (statuses[statuses.length - 1].eventMode) {
            console.log('del/line')
            statuses.push(actual[0])
        }
        console.log('ctrl z', statuses)
        if (statuses.length == 0)
            return
        let status = statuses[statuses.length - 1]
        console.log('undo', status)

        xLabel.value = status.xLabel
        yLabel.value = status.yLabel
        xLabel.placeholder = status.xPlaceholder
        yLabel.placeholder = status.yPlaceholder
        addLineBtn.textContent = status.addLineText
        allDots.value = status.allDots
        allLines.value = status.allLines
        resultArea.value = status.resultArea
        window.chartData.datasets = status.data
        drawMode = status.drawMode
        tempData = status.tempData
        dotIndex.value = status.dotIndex

        window.chart.update()
        window.chart.resetZoom()
        updateLists()
        statuses.pop()
        statuses.pop()
    }
})

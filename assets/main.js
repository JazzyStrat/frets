import { triadMap, noteMapFlats, noteMapSharps, diatonicWheel } from './maps.js'

const LAST_FRET = 15

const mainboard = []
const freeboard = []
const boards = [mainboard, freeboard]

// for main board
let tri = []

let root
let third
let fifth

// dashboard
let rootAlpha // just note letter as string
let quality // maj, min, dim, aug
let inversion

let triadInfo = document.getElementById('triad-info')

let keyMode = false
let capturedRoot = null
let wheelIdx
let keyModeBtn = document.getElementById('key-mode')

// guard
let animating = false

// hit up the map, identify triad
function calcTriadType() {
    const firstInterval = tri[1].abs - tri[0].abs
    const secInterval = tri[2].abs - tri[1].abs
    const intervals = `${firstInterval},${secInterval}`

    const desc = triadMap.get(intervals)
    if (desc == undefined) {
        alert('rutro, unidentifiable triad')
        return null
    }

    quality = desc.quality
    inversion = desc.inversion
    root = tri[desc.rootIdx]
    rootAlpha = root.innerText

    if (keyMode && !capturedRoot) {
        capturedRoot = rootAlpha
    }

    third = tri[desc.thirdIdx]
    fifth = tri[desc.fifthIdx]

    tri.forEach((div) => {
        div.lastElementChild.classList.add('active')
    })
    third.lastElementChild.classList.add('third-color')
    fifth.lastElementChild.classList.add('fifth-color')

    alphaCheck()
    updateUI()
    return desc
}

function alphaCheck() {
    if (quality == 'aug') {
        return
    }

    let rootAscii = root.innerText.charCodeAt(0)
    let thirdAscii = third.innerText.charCodeAt(0)
    let fifthAscii = fifth.innerText.charCodeAt(0)

    const distOne = thirdAscii - rootAscii
    const distTwo = fifthAscii - thirdAscii

    // ensure correct alpha spelling
    // alpha dist of either 2 or -5 covers thirds, sixths, or thirds wrapped
    // A B C D E F G A                     TODO: fix for F dim alphas
    if (
        !keyMode &&
        ((distOne != 2 && distOne != -5) || (distTwo != 2 && distTwo != -5))
    ) {
        switchSigns()
        updateDash()
        rootAlpha = root.innerText
    }
    if (validSwitchableKey() && !keyMode) {
        signTog.classList.remove('inactive')
    } else if (!keyMode) {
        signTog.classList.add('inactive')
    }
}

function clearStyle() {
    tri.forEach((div) => {
        div.lastElementChild.classList.remove('active')
        div.lastElementChild.classList.remove('third-color')
        div.lastElementChild.classList.remove('fifth-color')
    })
}

function clearTri() {
    if (tri[0] == null) {
        return
    }
    clearStyle()
    tri = []
}
// -|-|-|-
function restoreStyle() {
    tri.forEach((div) => {
        div.lastElementChild.classList.add('active')
    })
    const desc = calcTriadType()
    tri[desc.thirdIdx].lastElementChild.classList.add('third-color')
    tri[desc.fifthIdx].lastElementChild.classList.add('fifth-color')
}

// return note as letter
function absToNote(note, flats) {
    const noteVal = note % 12 // knock down to map val
    if (flats) {
        for (let [k, v] of noteMapSharps) {
            if (k == noteVal) {
                return v
            }
        }
    } else
        for (let [k, v] of noteMapFlats) {
            if (k == noteVal) {
                return v
            }
        }
}

// distance from nut to fret n
function TwelfthRoot(n) {
    return 1 - Math.pow(2, -n / 12)
}

// params: board css ID, empty ref array
function buildFretboard(boardID, gtrStringsArr) {
    const board = document.getElementById(boardID)

    // calc fret widths
    const fretWidths = []
    const relDist = TwelfthRoot(LAST_FRET) // ~0.579

    let prev = 0
    for (let n = 1; n <= LAST_FRET; n++) {
        const d = TwelfthRoot(n)
        const fspan = (d - prev) / relDist
        fretWidths.push(fspan)
        prev = d
    }

    let abs = 0 // discrete absolute pitch vals (0 == Open Lo E)
    const stringGauges = [0.046, 0.036, 0.026, 0.017, 0.013, 0.01] // EXL110
    for (let s = 0; s <= 5; s++) {
        // set string widths
        const row = document.createElement('div')
        row.className = 'string-row'

        const strDia = stringGauges[s] * 100
        row.style.setProperty('--before-height', `${strDia}px`)
        const string = []

        const nutZero = document.createElement('div')
        nutZero.className = 'nut'

        // set nut values, Standard Tuning intervals
        if (s <= 3) {
            abs = s * 5
        } else if (s == 4) {
            abs = abs + 4
        } else {
            abs = abs + 5
        }

        // bundle up baby, loosey goosey javascript
        nutZero.abs = abs
        nutZero.coord = [s, 0] // [string, fret]
        string.push(nutZero)
        row.appendChild(nutZero)

        for (let [i, frac] of fretWidths.entries()) {
            const fw = document.createElement('div')
            fw.className = 'fw'
            fw.abs = abs + i + 1
            fw.coord = [s, i + 1]
            string.push(fw) // references

            fw.style.flex = `0 0 calc(${frac * 100}% )`

            const dot = document.createElement('div')
            dot.className = 'marker'

            // single dot markers
            if (i % 2 == 0 && i >= 2 && i <= 8 && s == 2) {
                fw.appendChild(dot)
            }
            // 12th fret double dot markers
            if (i == 11 && (s == 1 || s == 4)) {
                if (s == 1) {
                    dot.classList.add('marker-12-top')
                }
                if (s == 4) {
                    dot.classList.add('marker-12-bottom')
                }
                fw.appendChild(dot)
            }
            // final 15th fret marker
            if (i == 14 && s == 2) {
                fw.appendChild(dot)
            }

            row.appendChild(fw)
        }

        gtrStringsArr.push(string)
        board.appendChild(row)
    }

    const fretNums = document.createElement('div')
    fretNums.id = 'fret-nums'

    const nutNum = document.createElement('div')
    nutNum.className = 'nut'
    nutNum.innerHTML = `<p>0</p>`

    fretNums.appendChild(nutNum)
    // Align numbers under frets
    fretWidths.forEach((frac, i) => {
        const fretNum = document.createElement('div')
        fretNum.className = 'fret-number'
        fretNum.style.flex = `0 0 calc(${frac * 100}% )`
        fretNum.innerHTML = `<p>${i + 1}</p>`
        fretNums.appendChild(fretNum)
    })
    board.insertAdjacentElement('afterend', fretNums)

    // hidden, togglable notes
    gtrStringsArr.forEach((string) => {
        string.forEach((note) => {
            const noteText = document.createElement('emb')
            noteText.innerText = absToNote(note.abs, false)
            note.appendChild(noteText)
        })
    })

    board.addEventListener('click', (e) => {
        const fretDiv = e.target.closest('.fw') || e.target.closest('.nut')
        if (fretDiv) {
            if (boardID == 'board') {
                initTriad(fretDiv)
            } else {
                fretDiv.lastElementChild.classList.toggle('active')
            }
        }
    })
}

// 0th Maj triad init
function initTriad(fd) {
    clearTri()

    wheelIdx = 0
    capturedRoot = null

    // starting on E A D G strings
    if (fd.coord[0] < mainboard.length - 2) {
        const thirdPitch = fd.abs + 4
        const fifthPitch = fd.abs + 7

        // proceedurally match targets
        for (let f = 0; f <= LAST_FRET; ++f) {
            if (mainboard[fd.coord[0] + 1][f].abs == thirdPitch) {
                third = mainboard[fd.coord[0] + 1][f] // this is div
                break
            }
        }

        for (let f = 0; f < LAST_FRET; ++f) {
            if (mainboard[fd.coord[0] + 2][f].abs == fifthPitch) {
                fifth = mainboard[fd.coord[0] + 2][f] // this is div

                tri.push(fd)
                tri.push(third)
                tri.push(fifth)
                break
            }
        }

        // B string, 2nd inversion
    } else if (fd.coord[0] == 4) {
        // |E---------
        // |B---------
        // |G---------
        // unlayable chord
        if (!mainboard[3][fd.coord[1] - 1] || !mainboard[5][fd.coord[1] - 1]) {
            return
        }
        fifth = mainboard[3][fd.coord[1] - 1]
        third = mainboard[5][fd.coord[1] - 1]

        tri.push(fifth)
        tri.push(fd)
        tri.push(third)

        // high E string, 1st inversion
    } else {
        // exclude highest playable note on fretboard
        if (fd == mainboard[5][LAST_FRET]) return

        fifth = mainboard[4][fd.coord[1]]
        third = mainboard[3][fd.coord[1] + 1]

        tri.push(third)
        tri.push(fifth)
        tri.push(fd)
    }

    if (activeIntervalID) {
        takeSnap()
        clearInterval(activeIntervalID)
        activeIntervalID = setInterval(runInterval, duration)
    }
    calcTriadType()
}

// shifts triad given raw absolute pitch array and offset from
// current string
function shiftTriad(absPitches, offset) {
    let newTriadPitches = []
    let s = tri[0].coord[0] + offset // starting string = current + 0/1/-1/x

    if (s < 0 || s > 3) {
        console.log(`vertically unshiftable to ${s}`)
        glow()
        return false
    }

    for (const pitch of absPitches) {
        for (let f = 0; f <= LAST_FRET; f++) {
            if (mainboard[s][f].abs == pitch) {
                newTriadPitches.push(mainboard[s][f])
                s++
                break
            }
        }
    }

    // validate newTriad
    // TODO: evaluate neccesity of both conditions
    if (
        newTriadPitches.length != 3 ||
        animating
        // newTriadPitches.includes(undefined)
    ) {
        // glow()
        return false
    }

    let el, dx, dy
    switch (true) {
        // animate all 3 notes moving
        case offset == 0 || offset < -1 || offset > 1: {
            const bundles = getTriBundles(newTriadPitches)
            animating = true
            for (let e of bundles) {
                requestAnimationFrame(() => {
                    e.style.transition = 'transform 120ms ease'
                    e.style.transform = `translate(${e.dx}px, ${e.dy}px)`
                    e.addEventListener(
                        'transitionend',
                        () => {
                            e.style.transition = ''
                            e.style.transform = ''
                            animating = false
                            clearTri()

                            tri = newTriadPitches
                            calcTriadType()
                        },
                        { once: true }
                    )
                })
            }
            return true
        }
        // animate single note, more performant
        case offset == 1: {
            el = tri[0].lastElementChild

            const oldRect = el.getBoundingClientRect()
            const newRect =
                newTriadPitches[2].lastElementChild.getBoundingClientRect()

            dx = newRect.left - oldRect.left
            dy = newRect.top - oldRect.top

            break
        }

        case offset == -1: {
            el = tri[2].lastElementChild
            const oldRect = el.getBoundingClientRect()
            const newRect =
                newTriadPitches[0].lastElementChild.getBoundingClientRect()

            dx = newRect.left - oldRect.left
            dy = newRect.top - oldRect.top

            break
        }
    }

    animating = true
    requestAnimationFrame(() => {
        el.style.transition = 'transform 120ms ease'
        el.style.transform = `translate(${dx}px, ${dy}px)`
        el.addEventListener(
            'transitionend',
            () => {
                el.style.transition = ''
                el.style.transform = ''
                animating = false

                clearTri()
                tri = newTriadPitches
                calcTriadType()
            },
            { once: true }
        )
    })
    return true
}

// returns dx,dy for each note shift
function getTriBundles(newTriad) {
    const triIntervals = `${tri[1].abs - tri[0].abs},${tri[2].abs - tri[1].abs}`
    const triDesc = triadMap.get(triIntervals)

    const newIntervals =
        `${newTriad[1].abs - newTriad[0].abs},` +
        `${newTriad[2].abs - newTriad[1].abs}`
    const newDesc = triadMap.get(newIntervals)

    const oldRoot = tri[triDesc.rootIdx].lastElementChild
    const oldThird = tri[triDesc.thirdIdx].lastElementChild
    const oldFifth = tri[triDesc.fifthIdx].lastElementChild

    const newRoot = newTriad[newDesc.rootIdx].lastElementChild
    const newThird = newTriad[newDesc.thirdIdx].lastElementChild
    const newFifth = newTriad[newDesc.fifthIdx].lastElementChild

    const oldRootRect = oldRoot.getBoundingClientRect()
    const newRootRect = newRoot.getBoundingClientRect()

    const oldThirdRect = oldThird.getBoundingClientRect()
    const newThirdRect = newThird.getBoundingClientRect()

    const oldFifthRect = oldFifth.getBoundingClientRect()
    const newFifthRect = newFifth.getBoundingClientRect()

    const rootDx = newRootRect.left - oldRootRect.left
    const rootDy = newRootRect.top - oldRootRect.top

    const thirdDx = newThirdRect.left - oldThirdRect.left
    const thirdDy = newThirdRect.top - oldThirdRect.top

    const fifthDx = newFifthRect.left - oldFifthRect.left
    const fifthDy = newFifthRect.top - oldFifthRect.top

    let triBundles = [oldRoot, oldThird, oldFifth]
    triBundles[0].dx = rootDx
    triBundles[0].dy = rootDy
    triBundles[1].dx = thirdDx
    triBundles[1].dy = thirdDy
    triBundles[2].dx = fifthDx
    triBundles[2].dy = fifthDy

    return triBundles
}

// indicate move not possible / current state
function glow() {
    let refCopy = [...tri]
    for (let note of refCopy) {
        note.lastElementChild.classList.add('glow')
    }
    setTimeout(() => {
        for (let note of refCopy) {
            note.lastElementChild.classList.remove('glow')
        }
    }, 200) // is that enough, marvin
}

function switchSigns() {
    let flats = mainboard[0][2].innerText.includes('b')

    boards.forEach((b) => {
        for (let s = 0; s < b.length; s++) {
            for (let f = 0; f < b[s].length; f++) {
                let l = b[s][f]
                if (l.innerText.length > 1) {
                    l.lastChild.innerText = absToNote(l.abs, flats)
                }
            }
        }
    })

    if (flats) {
        signTog.innerText = '♭'
    } else {
        signTog.innerText = '♯'
    }
}

// mutates pitch vals and calls shiftTriad()
function upTriad(lat = false) {
    let freqs = []
    tri.forEach((note) => {
        freqs.push(note.abs)
    })

    // use TriadMap + diatonicWheel array to get next freqs
    if (lat && keyMode) {
        // get next lateral chord index
        if (wheelIdx + 1 < diatonicWheel.length) {
            wheelIdx++
        } else {
            wheelIdx = 0
        }

        let nextQuality = diatonicWheel[wheelIdx].q
        let nextIntervals = '' // ex ("4,3") root major

        // backwards map key lookup
        for (let [k, v] of triadMap) {
            // inversion type will be the same for lateral changes
            if (v.inversion == inversion && v.quality == nextQuality) {
                nextIntervals = k
                break
            }
        }

        // different span use based on inversion type
        // stemming from root offset (os)
        // still orderd by pitch in array
        switch (inversion) {
            case 'root position': {
                freqs[0] += diatonicWheel[wheelIdx].os
                freqs[1] = freqs[0] + Number(nextIntervals[0])
                freqs[2] = freqs[1] + Number(nextIntervals[2])
                break
            }
            case '1st inversion': {
                freqs[2] += diatonicWheel[wheelIdx].os
                freqs[1] = freqs[2] - Number(nextIntervals[2])
                freqs[0] = freqs[1] - Number(nextIntervals[0])
                break
            }
            case '2nd inversion': {
                freqs[1] += diatonicWheel[wheelIdx].os
                freqs[0] = freqs[1] - Number(nextIntervals[0])
                freqs[2] = freqs[1] + Number(nextIntervals[2])
                break
            }
        }
    } else {
        // same triad, inverted up
        let lp = freqs[0] // low pitch
        freqs[0] = freqs[1]
        freqs[1] = freqs[2]
        freqs[2] = lp + 12
    }

    // regular position up shift
    if (lat == false) {
        shiftTriad(freqs, 1)
        return
        // allows possible wrap-around to next string set (both modes)
    }

    // corner hit -- use snapshot for auto cycling mode
    if (!shiftTriad(freqs, 0) && !shiftTriad(freqs, 1)) {
        wheelIdx = (--wheelIdx + diatonicWheel.length) % diatonicWheel.length
        if (activeIntervalID) snapBack()
    }
}

function downTriad(lat = false) {
    let freqs = []
    tri.forEach((note) => {
        freqs.push(note.abs)
    })

    if (lat && keyMode) {
        if (wheelIdx - 1 >= 0) {
            wheelIdx--
        } else {
            wheelIdx = diatonicWheel.length - 1
        }

        let nextQuality = diatonicWheel[wheelIdx].q
        let nextIntervals
        for (let [k, v] of triadMap) {
            // since inversion type is constant laterally
            if (v.inversion == inversion && v.quality == nextQuality) {
                nextIntervals = k
                break
            }
        }

        // need next offset value when wrapping backwards
        let offset
        if (wheelIdx == diatonicWheel.length - 1) {
            offset = diatonicWheel[0].os
        } else {
            offset = diatonicWheel[wheelIdx + 1].os
        }

        switch (inversion) {
            case 'root position': {
                freqs[0] -= offset
                freqs[1] = freqs[0] + Number(nextIntervals[0])
                freqs[2] = freqs[1] + Number(nextIntervals[2])
                break
            }
            case '1st inversion': {
                freqs[2] -= offset
                freqs[1] = freqs[2] - Number(nextIntervals[2])
                freqs[0] = freqs[1] - Number(nextIntervals[0])
                break
            }
            case '2nd inversion': {
                freqs[1] -= offset
                freqs[0] = freqs[1] - Number(nextIntervals[0])
                freqs[2] = freqs[1] + Number(nextIntervals[2])
                break
            }
        }
    } else {
        // same triad, inverted down
        let hp = freqs[2] // high pitch
        freqs[2] = freqs[1]
        freqs[1] = freqs[0]
        freqs[0] = hp - 12
    }

    // regular position down shift
    if (lat == false) {
        shiftTriad(freqs, -1)
        // allow possible wrap-around to next string set (both modes)
        // with proper animation type
        return
    }

    // corner
    if (!shiftTriad(freqs, 0) && !shiftTriad(freqs, -1)) {
        wheelIdx = (wheelIdx + 1) % diatonicWheel.length
        snapBack()
    }
}

let dash = document.getElementById('dash')
const minBtn = document.getElementById('min')
const majBtn = document.getElementById('maj')
const dimBtn = document.getElementById('dim')
const augBtn = document.getElementById('aug')
const signTog = document.getElementById('sign-tog')
const buttons = document.getElementById('buttons')

// triad to return to when we hit end of board
let snap = {
    wheelIdx: null,
    loStr: 0,
    abs: [],
}

function takeSnap() {
    // record original position
    snap.wheelIdx = wheelIdx
    snap.loStr = tri[0].coord[0]

    snap.abs = []
    tri.forEach((note) => {
        snap.abs.push(note.abs)
    })
}

function snapBack() {
    wheelIdx = snap.wheelIdx
    shiftTriad(snap.abs, snap.loStr - tri[0].coord[0])
}

const cycleBtns = document.getElementById('cycle-btns')
let activeDirection = null
let activeIntervalID = null

for (const btn of cycleBtns.children) {
    btn.addEventListener('click', (e) => {
        if (activeIntervalID) {
            clearInterval(activeIntervalID)
            activeIntervalID = null
            activeDirection.classList.remove('active')
            snap = {
                wheelIdx: null,
                abs: [],
                loStr: 0,
            }

            if (e.target === activeDirection) return
        }

        takeSnap()
        activeDirection = e.target
        activeDirection.classList.add('active')
        activeIntervalID = setInterval(runInterval, duration)
    })
}

function runInterval() {
    if (activeDirection.id == 'cycle-up') {
        upTriad(true)
    } else {
        downTriad(true)
    }
}

const speedDisplay = document.getElementById('speed-display')
const speeds = [1, 2, 4, 8, 16, 32]
let speedIdx = 1
let duration = speeds[speedIdx] * 1000

function updateSpeedDisplay() {
    speedDisplay.innerText = `${speeds[speedIdx]} sec`
}

updateSpeedDisplay()

const cycleSpeedBtns = document.getElementById('cycle-speeds')
cycleSpeedBtns.addEventListener('click', (e) => {
    if (e.target.id == 'speed-up' && speedIdx > 0) {
        speedIdx--
    } else if (e.target.id == 'speed-down' && speedIdx < speeds.length - 1) {
        ++speedIdx
    }

    duration = speeds[speedIdx] * 1000
    updateSpeedDisplay()

    if (activeIntervalID) {
        clearInterval(activeIntervalID)
        activeIntervalID = setInterval(runInterval, duration)
    }
})

// delegate button click actions
buttons.addEventListener('click', (e) => {
    if (tri.length < 1 && e.target.id != 'sign-tog') {
        displayWarning()
        return
    }
    const btnID = e.target.id
    // only clickable for valid keys
    if (btnID == 'sign-tog') {
        switchSigns()
        updateDash()
        return
    }
    const thirdIdx = tri.indexOf(third)
    const fifthIdx = tri.indexOf(fifth)

    clearStyle() // pre-emptive
    let ok = false
    switch (btnID) {
        case quality: {
            glow()
            break
        }
        case 'maj': {
            ok = toMaj(thirdIdx, fifthIdx)
            break
        }
        case 'min': {
            ok = toMin(thirdIdx, fifthIdx)
            break
        }
        case 'dim': {
            ok = toDim(thirdIdx, fifthIdx)
            break
        }
        case 'aug': {
            ok = toAug(thirdIdx, fifthIdx)
            break
        }
        case 'key-mode': {
            toggleKeyMode()
        }
    }
    if (ok) {
        calcTriadType()
        if (keyMode) toggleKeyMode()
    } else {
        restoreStyle()
        glow()
    }
})

const dpad = document.getElementById('dpad')
dpad.addEventListener('click', (e) => {
    if (tri.length < 1) {
        displayWarning()
        return
    }
    let dirBtn = e.target.id
    switch (dirBtn) {
        case 'up':
            upTriad()
            break
        case 'down':
            downTriad()
            break
        case 'up-lat':
            upTriad(true)
            break
        case 'down-lat':
            downTriad(true)
    }
})

document.addEventListener('keydown', (event) => {
    if (tri.length < 1) {
        return
    }
    switch (event.key) {
        case 'ArrowUp':
        case 'k': {
            upTriad()
            break
        }
        case 'ArrowDown':
        case 'j': {
            downTriad()
            break
        }
        case 'ArrowRight':
        case 'l': {
            upTriad(true)
            break
        }
        case 'ArrowLeft':
        case 'h': {
            downTriad(true)
        }
    }
})

function updateDash() {
    if (capturedRoot) {
        triadInfo.innerHTML = `<div id='key-hud'>Key of ${capturedRoot}</div>  
			<div><b>${rootAlpha} ${quality}</b></div>
			<div><i>${inversion}</i></div>`
        triadInfo.classList.remove('narrow')
    } else {
        triadInfo.innerHTML = `
		<p class="ghost"></p>
			<p><b>${rootAlpha} ${quality}</b><i>${inversion}</i></p>
			<p class='ghost'></p>`
        triadInfo.classList.add('narrow')
    }
}

const qualityBtnz = [minBtn, majBtn, dimBtn, augBtn]

function updateUI() {
    updateDash()

    for (let btn of qualityBtnz) {
        btn.classList.remove('active')
    }

    if (!keyMode) {
        keyModeBtn.classList.remove('visible', 'active')
        switch (quality) {
            case 'maj':
                majBtn.classList.add('active')
                keyModeBtn.classList.add('visible')
                break
            case 'min':
                minBtn.classList.add('active')
                break
            case 'dim':
                dimBtn.classList.add('active')
                break
            case 'aug':
                augBtn.classList.add('active')
        }
    }
}

function validSwitchableKey() {
    let check = keyMode ? capturedRoot : rootAlpha

    let validKeys = ['C', 'Gb', 'F#']
    for (let key of validKeys) {
        if (check == key) {
            return true
        }
    }
    return false
}

function toggleKeyMode() {
    keyMode = !keyMode
    keyModeBtn.classList.toggle('active')

    if (keyMode) {
        capturedRoot = rootAlpha
        wheelIdx = 0
    } else {
        capturedRoot = null
    }

    // what is this preventing?
    if (validSwitchableKey()) {
        signTog.classList.remove('inactive')
    } else {
        signTog.classList.add('inactive')
    }
}

function displayWarning() {
    if (document.querySelector('.select-warn') !== null) return
    const warning = document.createElement('h3')
    warning.className = 'select-warn'
    warning.innerText = 'please select a note first'

    dash.appendChild(warning)

    setTimeout(() => {
        warning.remove()
    }, 2000)
}

// Shift functions
function toMaj(thirdIdx, fifthIdx) {
    if (quality == 'min' && third.nextElementSibling) {
        tri[thirdIdx] = third.nextElementSibling
    } else if (quality == 'dim') {
        tri[thirdIdx] = third.nextElementSibling
        tri[fifthIdx] = fifth.nextElementSibling
    } else if (quality == 'aug' && fifth.previousElementSibling) {
        tri[fifthIdx] = fifth.previousElementSibling
    } else {
        return false
    }
    return true
}

function toMin(thirdIdx, fifthIdx) {
    // mainboard[third.s][third.f - 1]

    if (quality == 'maj' && third.previousElementSibling) {
        tri[thirdIdx] = third.previousElementSibling
    } else if (quality == 'dim') {
        tri[fifthIdx] = fifth.nextElementSibling
    } else if (quality == 'aug' && fifth.previousElementSibling) {
        tri[thirdIdx] = third.previousElementSibling
        tri[fifthIdx] = fifth.previousElementSibling
    } else {
        return false
    }
    return true
}

function toDim(thirdIdx, fifthIdx) {
    if (quality == 'maj' && fifth.previousElementSibling) {
        tri[thirdIdx] = third.previousElementSibling
        tri[fifthIdx] = fifth.previousElementSibling
    } else if (
        quality == 'aug' &&
        third.previousElementSibling &&
        fifth.previousElementSibling?.previousElementSibling
    ) {
        tri[fifthIdx] = fifth.previousElementSibling.previousElementSibling
        tri[thirdIdx] = tri[thirdIdx].previousElementSibling
    } else if (quality == 'min' && fifth.previousElementSibling) {
        // GUITAR!
        tri[fifthIdx] = fifth.previousElementSibling
    } else {
        return false
    }
    return true
}

function toAug(thirdIdx, fifthIdx) {
    if (quality == 'maj' && fifth.nextElementSibling) {
        tri[fifthIdx] = fifth.nextElementSibling
    } else if (quality == 'min' && fifth.nextElementSibling) {
        tri[fifthIdx] = fifth.nextElementSibling
        tri[thirdIdx] = tri[thirdIdx].nextElementSibling
    } else if (
        quality == 'dim' &&
        fifth.nextElementSibling?.nextElementSibling
    ) {
        tri[fifthIdx] = fifth.nextElementSibling.nextElementSibling
        tri[thirdIdx] = tri[thirdIdx].nextElementSibling
    } else {
        return false
    }
    return true
}

buildFretboard('board', mainboard)
buildFretboard('board2', freeboard)

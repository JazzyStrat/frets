import {
    triadMap,
    noteMapFlats,
    noteMapSharps,
    diatonicWheel,
} from './/maps.js'

const LAST_FRET = 15

const mainboard = []
const freeboard = []

const boards = [mainboard, freeboard]
// for main board
let tri = []

let root
// todo: figure out if getting rid of these makes sense
// makes sense if you're ok having multiple local variables for them
let third
let fifth

// dashboard
let rootAlpha // just note letter as string
let quality // maj, min, dim aug
let inversion

let triadInfo = document.getElementById('triad-info')

let keyMode = false
let capturedRoot = null
let wheelIdx
let keyModeButton = document.getElementById('key-mode')

// hit up the map, identify triad
function calcTriadType() {
    const firstInterval = tri[1].abs - tri[0].abs
    const secInterval = tri[2].abs - tri[1].abs
    const intervals = `${firstInterval},${secInterval}`

    const desc = triadMap.get(intervals)
    if (desc == null) {
        alert('rutro, unidentifiable triad')
        return null
    }

    quality = desc.quality
    inversion = desc.inversion

    // if (quality != 'maj' && keyMode) {
    //     toggleKeyMode()
    // }
    // find root index, set rootAlpha and root
    for (let z = 0; z < 3; z++) {
        if (z != desc.thirdIdx && z != desc.fifthIdx) {
            rootAlpha = tri[z].innerText
            if (keyMode && wheelIdx == 0) capturedRoot = rootAlpha
            root = tri[z]
            break
        }
    }

    third = tri[desc.thirdIdx]
    fifth = tri[desc.fifthIdx]

    if (quality == 'aug') {
        // COMING SOON
        // rootAlpha += ` or ${tri[desc.thirdIdx].innerText} or ${fifth.innerText}`
    }

    tri.forEach((div) => {
        div.lastElementChild.classList.add('active')
    })
    third.lastElementChild.classList.add('third-color')
    fifth.lastElementChild.classList.add('fifth-color')

    alphaCheck(desc)
    updateUI()
    return desc
}

function alphaCheck(desc) {
    let rootAscii = root.innerText.charCodeAt(0)
    let thirdAscii = third.lastElementChild.innerText.charCodeAt(0)
    let fifthAscii = fifth.lastElementChild.innerText.charCodeAt(0)

    const distOne = Math.abs(thirdAscii - rootAscii)
    const distTwo = Math.abs(fifthAscii - thirdAscii)

    // ensure correct alpha spelling
    // alpha dist of either 2 or 5 covers thirds, sixths, or thirds wrapped
    // A B C D E F G A                     // this breaks f dim alphas
    if ((distOne != 2 && distOne != 5) || (distTwo != 2 && distTwo != 5)) {
        switchSignsRedux()
        for (let z = 0; z < 3; z++) {
            if (z != desc.thirdIdx && z != desc.fifthIdx) {
                rootAlpha = tri[z].innerText
                break
            }
        }
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
function buildFretboard(boardID, stringsArr) {
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

        // Standard Tuning intervals - set nut values
        if (s <= 3) {
            abs = s * 5
        } else if (s == 4) {
            abs = abs + 4
        } else {
            abs = abs + 5
        }

        // bundle up baby, loosey goosey javascript nutZero.abs = abs
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

        stringsArr.push(string)
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

    // add hidden, togglable notes
    stringsArr.forEach((string) => {
        string.forEach((note) => {
            const noteText = document.createElement('p')
            noteText.classList.add('emb')
            noteText.innerText = absToNote(note.abs, false)
            note.appendChild(noteText)
        })
    })

    board.addEventListener('click', (e) => {
        const fretDiv = e.target.closest('.fw') || e.target.closest('.nut')
        // exclude highest playable note on fretboard
        if (fretDiv && fretDiv != mainboard[5][LAST_FRET]) {
            if (boardID == 'board') {
                initTriad(fretDiv)
            } else {
                fretDiv.lastElementChild.classList.toggle('active')
            }
        }
    })
}

// lay as major triad
function initTriad(fd) {
    wheelIdx = 0
    clearTri()
    // E A D G strings
    // 0th inversion
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
        fifth = mainboard[4][fd.coord[1]]
        third = mainboard[3][fd.coord[1] + 1]

        tri.push(third)
        tri.push(fifth)
        tri.push(fd)
    }

    if (tri[0] == null) {
        return
    }
    calcTriadType()
}

// sets triad given raw absolute pitch array and string offset
// from current triad's lowest string
function shiftTriad(absPitches, offset) {
    let newTriad = []
    let s = tri[0].coord[0] + offset // starting string = current + 0/1/-1

    if (s < 0 || s > 3) {
        console.log('⚡️ unshiftable')
        glow()
        return false
    }

    for (const pitch of absPitches) {
        for (let f = 0; f <= LAST_FRET; f++) {
            if (mainboard[s][f].abs == pitch) {
                newTriad.push(mainboard[s][f])
                s++
                break
            }
        }
    }

    //TODO: evaluate neccesity of both conditions
    if (newTriad.length == 3 && !newTriad.includes(undefined)) {
        clearTri()
        tri = newTriad
        calcTriadType()
        return true
    } else {
        console.log('⚡️ unshiftable')
        glow()
        return false
    }
}

// indicate move not possible / current state
function glow() {
    for (let note of tri) {
        note.lastElementChild.classList.add('glow')
        // race condition?
    }
    setTimeout(() => {
        for (let note of tri) {
            note.lastElementChild.classList.remove('glow')
        }
    }, 200) // is that enough, marvin
}

function switchSignsRedux() {
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
}

function invertTriadUp(lat = false) {
    let freqs = []
    tri.forEach((note) => {
        freqs.push(note.abs)
    })
    // use map + array to get right freqs:
    // triadMap and diatonicWheel
    if (lat && keyMode) {
        if (wheelIdx + 1 < diatonicWheel.length) {
            wheelIdx++
        } else {
            wheelIdx = 0
        }

        let nextQuality = diatonicWheel[wheelIdx].q
        let nextIntervals
        // backwards map key lookup
        for (let [k, v] of triadMap) {
            // inversion type the same for lateral changes
            if (v.inversion == inversion && v.quality == nextQuality) {
                nextIntervals = k
                break
            }
        }
        if (nextIntervals == null) {
            glow()
            return
        }

        const desc = calcTriadType()
        let rootIdx = -1
        for (let z = 0; z < 3; z++) {
            if (z != desc.thirdIdx && z != desc.fifthIdx) {
                rootIdx = z
                break
            }
        }

        // different span use based on inversion type
        // stemming from root offset (os)
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
        // only works for root position shifts right now
    } else {
        // same triad, inverted up
        let lp = freqs[0] // low pitch
        freqs[0] = freqs[1]
        freqs[1] = freqs[2]
        freqs[2] = lp + 12
    }

    if (lat) {
        let ok = shiftTriad(freqs, 0)
        if (!ok) {
            // alert('breka on thru up')
            wheelIdx--
        }
        return
    }
    shiftTriad(freqs, 1)
}

function invertTriadDown(lat = false) {
    let freqs = []
    tri.forEach((note) => {
        freqs.push(note.abs)
    })

    if (lat && keyMode) {
        if (wheelIdx - 1 < 0) {
            wheelIdx = diatonicWheel.length - 1
        } else {
            wheelIdx--
        }

        let nextQuality = diatonicWheel[wheelIdx].q
        let nextIntervals
        for (let [k, v] of triadMap) {
            if (v.inversion == inversion && v.quality == nextQuality) {
                nextIntervals = k
                break
            }
        }
        if (nextIntervals == null) {
            glow()
            return
        }

        // need next offset value when going backwards
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
    if (lat) {
        let ok = shiftTriad(freqs, 0)
        if (!ok) {
            // alert('breka on thru down')
            if (wheelIdx == diatonicWheel.length - 1) {
                wheelIdx = 0
            } else {
                wheelIdx++
            }
        }
        return
    }
    shiftTriad(freqs, -1)
}

let dash = document.getElementById('dash')
const minBtn = document.getElementById('min')
const majBtn = document.getElementById('maj')
const dimBtn = document.getElementById('dim')
const augBtn = document.getElementById('aug')

const buttons = document.getElementById('buttons')

// delegate button click actions
buttons.addEventListener('click', (e) => {
    if (tri.length < 1) {
        displayWarning()
        return
    }
    const buttID = e.target.id
    if (buttID == 'sign-tog') {
        signButtonNameToggle(e)
        return
    }
    const thirdIdx = tri.indexOf(third)
    const fifthIdx = tri.indexOf(fifth)

    clearStyle() // pre-emptive
    let ok = false
    switch (buttID) {
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
            if (keyMode) toggleKeyMode()
            // capturedRoot = null -- cleaner way to GET OUT of key MODE???
            break
        }
        case 'dim': {
            ok = toDim(thirdIdx, fifthIdx)
            if (keyMode) toggleKeyMode()
            break
        }
        case 'aug': {
            ok = toAug(thirdIdx, fifthIdx)
            if (keyMode) toggleKeyMode()
            break
        }
        case 'key-mode': {
            toggleKeyMode()
        }
    }
    if (ok) {
        calcTriadType()
    } else {
        restoreStyle()
        glow()
    }
})

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

// really only useful when current triad is neutral (like F#/Gb and key of C)
function signButtonNameToggle(e) {
    if (rootAlpha == undefined) {
        return
    }
    if (e.target.innerText.includes('♭')) {
        e.target.innerText = '♯'
    } else {
        e.target.innerText = '♭'
    }
    switchSignsRedux()
    calcTriadType()
}

const qualityBtnz = [minBtn, majBtn, dimBtn, augBtn]

function updateName() {
    if (capturedRoot) {
        triadInfo.innerHTML = `<div id='key-hud'>Key of ${capturedRoot}</div>  
			<div><b>${rootAlpha} ${quality}</b></div>
			<div><i>${inversion}</i></div>`
    } else {
        triadInfo.innerHTML = `
		<p class="ghost"></p>
			<p><b>${rootAlpha} ${quality}</b><i>${inversion}</i></p>
			<p class='ghost'></p>`
    }
}

function updateUI() {
    updateName()
    triadInfo.classList.add('fade-in')

    for (let s of qualityBtnz) {
        s.classList.remove('active')
    }
    if (keyMode) keyModeButton.classList.add('visible', 'active')
    else {
        keyModeButton.classList.remove('visible', 'active')
        switch (quality) {
            case 'maj':
                majBtn.classList.add('active')
                keyModeButton.classList.add('visible')
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

const dpad = document.getElementById('dpad')

dpad.addEventListener('click', (e) => {
    if (tri.length < 1) {
        displayWarning()
        return
    }
    let dirBtn = e.target.id
    switch (dirBtn) {
        case 'up':
            invertTriadUp()
            break
        case 'down':
            invertTriadDown()
            break
        case 'up-lat':
            invertTriadUp(true)
            break
        case 'down-lat':
            invertTriadDown(true)
    }
})

document.addEventListener('keydown', (event) => {
    if (tri.length < 1) {
        return
    }
    switch (event.key) {
        case 'ArrowUp':
        case 'k': {
            invertTriadUp()
            break
        }
        case 'ArrowDown':
        case 'j': {
            invertTriadDown()
            break
        }
        case 'ArrowRight':
        case 'l': {
            invertTriadUp(true)
            break
        }
        case 'ArrowLeft':
        case 'h': {
            invertTriadDown(true)
            break
        }
    }
})

function toggleKeyMode() {
    keyMode = !keyMode
    if (keyMode) {
        capturedRoot = rootAlpha
        wheelIdx = 0
    } else {
        capturedRoot = null
    }
    keyModeButton.classList.toggle('active')
}

function displayWarning() {
    if (document.querySelector('.select-warn') !== null) return
    const warning = document.createElement('h3')
    warning.className = 'select-warn'
    warning.innerText = 'please select a note first'
    let lc = dash.lastElementChild
    dash.appendChild(warning, lc)

    setTimeout(() => {
        warning.remove()
    }, 2000)
}

console.log(TwelfthRoot(12)) // HARMONIC

buildFretboard('board', mainboard)
buildFretboard('board2', freeboard)

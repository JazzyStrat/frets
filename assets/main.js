let LAST_FRET = 15

let mainboard = []
let freeboard = []

let boards = [mainboard, freeboard]

// for main board
let tri = []

let third
let fifth

// dashboard
let root // just note letter as string
let quality
let inversion

const triadInfo = document.getElementById('triad-info')

const dash = document.getElementById('dash')

function calcTriadType() {
    const firstInt = tri[1].abs - tri[0].abs
    const secInt = tri[2].abs - tri[1].abs
    const intervals = `${firstInt},${secInt}`

    const triadConfigs = {
        '4,3': {
            quality: 'maj',
            inversion: 'root position',
            thirdIdx: 1,
            fifthIdx: 2,
        },
        '3,5': {
            quality: 'maj',
            inversion: '1st inversion',
            thirdIdx: 0,
            fifthIdx: 1,
        },
        '5,4': {
            quality: 'maj',
            inversion: '2nd inversion',
            thirdIdx: 2,
            fifthIdx: 0,
        },
        '3,4': {
            quality: 'min',
            inversion: 'root position',
            thirdIdx: 1,
            fifthIdx: 2,
        },
        '4,5': {
            quality: 'min',
            inversion: '1st inversion',
            thirdIdx: 0,
            fifthIdx: 1,
        },
        '5,3': {
            quality: 'min',
            inversion: '2nd inversion',
            thirdIdx: 2,
            fifthIdx: 0,
        },
    }

    const config = triadConfigs[intervals]
    if (config) {
        tri.forEach((note) => {
            note.lastElementChild.classList.remove('third-color')
            note.lastElementChild.classList.remove('fifth-color')
        })

        quality = config.quality
        inversion = config.inversion

        tri[config.thirdIdx].lastElementChild.classList.toggle('third-color')
        third = tri[config.thirdIdx]
        fifth = tri[config.fifthIdx]

        fifth.lastElementChild.classList.toggle('fifth-color')
    } else {
        console.log('failed to identify triad type')
    }

    // find root index
    for (let z = 0; z < 3; z++) {
        if ((z == config.thirdIdx && z) || z == config.fifthIdx) {
            continue
        }
        root = tri[z].innerText
    }
    let firstLetter = root.charCodeAt(0) // - 'A'.charCodeAt(0) // 6
    let secLetter = third.lastElementChild.innerText.charCodeAt(0) // - 'A'.charCodeAt(0) // 1

    // A B C D E F G A B

    const dist = Math.abs(secLetter - firstLetter)
    if (dist != 2 && dist != 5) {
        switchSigns()
        // find root index
        for (let z = 0; z < 3; z++) {
            if ((z == config.thirdIdx && z) || z == config.fifthIdx) {
                continue
            }
            root = tri[z].innerText
        }
    }
    updateDash()
}

const noteMap = new Map([
    ['A', 5], // #
    ['A#', 6],
    ['Bb', 6],
    ['B', 7], // #
    ['C', 8],
    ['C#', 9],
    ['Db', 9],
    ['D', 10], //
    ['D#', 11],
    ['Eb', 11],
    ['E', 0], // #
    ['F', 1], // b
    ['F#', 2],
    ['Gb', 2],
    ['G', 3], // #
    ['G#', 4],
    ['Ab', 4],
])

// return note as letter
function absToNote(note) {
    let next = 0
    const noteVal = note % 12 // knock down to map val
    for (let [k, v] of noteMap.entries()) {
        // if (next) {
        //     // get flats
        // }
        if (v == noteVal) {
            return k
            next = 1
        }
    }
}

// Equal temperament — normalized distance from nutZero to fret n:
function TwelfthRoot(n) {
    return 1 - Math.pow(2, -n / 12)
}

function buildFretboard(boardId, stringsArr) {
    const board = document.getElementById(boardId)

    // calc fret widths
    const fretWidths = []
    const visible = TwelfthRoot(LAST_FRET)
    let prev = 0
    for (let n = 1; n <= LAST_FRET; n++) {
        const d = TwelfthRoot(n)
        const segWidth = (d - prev) / visible // normalization
        fretWidths.push(segWidth)
        prev = d
    }

    let abs = 0 // discrete absolute pitch vals (0 == Open Lo E)
    const stringGauges = [0.046, 0.036, 0.026, 0.017, 0.013, 0.01] // EXL110 in inches
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

            noteText.innerText = absToNote(note.abs)
            note.appendChild(noteText)
        })
    })

    // single event delegation
    board.addEventListener('click', (e) => {
        const fretDiv = e.target.closest('.fw') || e.target.closest('.nut')
        if (fretDiv && fretDiv != mainboard[5][LAST_FRET]) {
            if (boardId == 'board') {
                initTriad(fretDiv)
            } else {
                fretDiv.lastElementChild.classList.toggle('active')
            }
        }
    })
}

function initTriad(fd) {
    // if two higher strings exist, try placing 0th pos maj triad
    if (fd.coord[0] < mainboard.length - 2) {
        // 0th inversion
        const secondPitch = fd.abs + 4
        const thirdPitch = fd.abs + 7
        for (let f = 0; f <= LAST_FRET; ++f) {
            if (mainboard[fd.coord[0] + 1][f].abs == secondPitch) {
                third = mainboard[fd.coord[0] + 1][f] // this is div
                break
            }
        }
        for (let f = 0; f < LAST_FRET; ++f) {
            if (mainboard[fd.coord[0] + 2][f].abs == thirdPitch) {
                fifth = mainboard[fd.coord[0] + 2][f] // this is div

                // clear old triad
                tri.forEach((div) => {
                    div.lastElementChild.classList.remove('active')
                })
                tri = []

                tri.push(fd)
                tri.push(third)
                tri.push(fifth)
                console.log('zero')
                break
            }
        }
    } else if (fd.coord[0] == 4) {
        if (!mainboard[3][fd.coord[1] - 1] || !mainboard[5][fd.coord[1] - 1]) {
            return
        }
        // B string, 2nd inversion
        tri.forEach((div) => {
            div.lastElementChild.classList.remove('active')
        })
        tri = []

        fifth = mainboard[3][fd.coord[1] - 1]
        third = mainboard[5][fd.coord[1] - 1]
        tri.push(fifth)
        tri.push(fd)
        tri.push(third)
        console.log('B STR', tri)
    } else {
        // high E string, 1st inversion
        tri.forEach((div) => {
            div.lastElementChild.classList.remove('active')
        })
        tri = []

        fifth = mainboard[4][fd.coord[1]]
        third = mainboard[3][fd.coord[1] + 1]

        tri.push(third)
        tri.push(fifth)
        tri.push(fd)
        console.log('TWo')
    }
    if (tri.length === 3) {
        tri.forEach((d) => {
            d.lastElementChild.classList.toggle('active')
        })
        calcTriadType()
    }
    document.getElementById('instructions').style.opacity = 0
}

// updated to prioritize vertical invertion over horizontal
function setTriad(absPitches, offset) {
    console.log('tryin to set')
    let newTriad = []

    let s = tri[0].coord[0] + offset
    if (s < 0 || s > 3) {
        console.log('early return')
        glow()
        return
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
    // wonderful, set tri
    if (newTriad.length == 3 && !newTriad.includes(undefined)) {
        tri.forEach((d) => {
            d.lastElementChild.classList.remove('active')
        })
        tri = []
        tri = newTriad
        tri.forEach((div) => {
            div.lastElementChild.classList.add('active')
        })
        calcTriadType()
    } else {
        console.log('⚡️')
        glow()
        newTriad = []
    }
}

function glow() {
    for (let note of tri) {
        note.lastElementChild.classList.add('glow')
        setTimeout(() => {
            for (let note of tri) {
                note.lastElementChild.classList.remove('glow')
            }
        }, 200)
    }
}

function updateDash() {
    triadInfo.innerHTML = `<b>${root} ${quality}</b> <i>${inversion}</i>`
    triadInfo.classList.add('fade-in')

    if (quality === 'maj') {
        major.classList.add('active')
        minor.classList.remove('active')
    } else {
        minor.classList.add('active')
        major.classList.remove('active')
    }
}

function switchSigns() {
    let sharps = mainboard[0][2].innerText.includes('#')
    boards.forEach((board) => {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].innerText.length > 1) {
                    let letter = board[i][j].innerText[0]
                    let ascii = letter.charCodeAt(0)
                    if (sharps) {
                        if (letter != 'G') {
                            letter = String.fromCharCode(ascii + 1)
                        } else {
                            letter = 'A'
                        }
                        board[i][j].firstChild.innerText = letter + 'b'
                    } else {
                        if (letter != 'A') {
                            letter = String.fromCharCode(ascii - 1)
                        } else {
                            letter = 'G'
                        }
                        board[i][j].firstChild.innerText = letter + '#'
                    }
                }
            }
        }
    })
    updateDash()
}

function invertTriadUp(lat = false) {
    let freqs = []
    tri.forEach((div) => {
        freqs.push(div.abs)
    })

    // if (freqs[0] + 12 > 24 + LAST_FRET) {
    //     glow()
    //     return
    // }

    let lp = freqs[0] // low pitch

    freqs[0] = freqs[1]
    freqs[1] = freqs[2]
    freqs[2] = lp + 12

    if (lat) {
        setTriad(freqs, 0)
        return
    }

    setTriad(freqs, 1)
}

function invertTriadDown(lat = false) {
    let freqs = []
    tri.forEach((div) => {
        freqs.push(div.abs)
    })

    // if (freqs[2] - 12 < 0) {
    //     glow()
    //     return
    // }

    let hp = freqs[2] // high pitch
    freqs[2] = freqs[1]
    freqs[1] = freqs[0]
    freqs[0] = hp - 12

    if (lat) {
        setTriad(freqs, 0)
        return
    }

    setTriad(freqs, -1)
}

dash.addEventListener('click', () => {
    if (tri.length < 1) {
        displayWarning()
    }
})

const minor = document.getElementById('min')
minor.addEventListener('click', () => {
    if (quality != 'min' && tri.length > 0) {
        let thirdIdx = tri.indexOf(third)
        tri[thirdIdx].lastElementChild.classList.remove('active')
        tri[thirdIdx] = third.previousElementSibling

        tri[thirdIdx].lastElementChild.classList.add('active')

        calcTriadType()
    }
})

const major = document.getElementById('maj')
major.addEventListener('click', () => {
    if (quality != 'maj' && tri.length > 0) {
        let thirdIdx = tri.indexOf(third)
        tri[thirdIdx].lastElementChild.classList.remove('active')
        tri[thirdIdx] = third.nextElementSibling

        tri[thirdIdx].lastElementChild.classList.add('active')

        calcTriadType()
    }
})

function signButtonNameToggle(e) {
    if (root == undefined) {
        return
    }
    if (e.target.innerText.includes('b')) {
        e.target.innerText = 'sharps (#)'
    } else {
        e.target.innerText = 'flats (b)'
    }
    switchSigns()
    calcTriadType()
}

const signTog = document.getElementById('sign-tog')
signTog.addEventListener('click', (e) => signButtonNameToggle(e))

const upButton = document.getElementById('up')
upButton.addEventListener('click', () => {
    if (tri.length > 1) {
        invertTriadUp()
    }
})

const downButton = document.getElementById('down')
downButton.addEventListener('click', () => {
    if (tri.length > 1) {
        invertTriadDown()
    }
})

const upLatBtn = document.getElementById('up-lat')
upLatBtn.addEventListener('click', () => {
    if (tri.length > 1) {
        invertTriadUp(true)
    }
})

const downLatBtn = document.getElementById('down-lat')
downLatBtn.addEventListener('click', () => {
    if (tri.length > 1) {
        invertTriadDown(true)
    }
})

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'k') {
        if (tri.length > 1) {
            invertTriadUp()
        }
    }
    if (event.key === 'ArrowDown' || event.key === 'j') {
        if (tri.length > 1) {
            invertTriadDown()
        }
    }
    if (event.key === 'ArrowRight' || event.key === 'l') {
        if (tri.length > 1) {
            invertTriadUp(true)
        }
    }
    if (event.key === 'ArrowLeft' || event.key === 'h') {
        if (tri.length > 1) {
            invertTriadDown(true)
        }
    }
})

function displayWarning() {
    if (document.querySelector('.select-warn') == null) {
        const warning = document.createElement('p')
        warning.className = 'select-warn'
        warning.innerText = 'please select a note first'
        let lc = dash.lastElementChild
        dash.appendChild(warning, lc)

        setTimeout(() => {
            warning.remove()
        }, 2000)
    }
}
// MAIN
buildFretboard('board', mainboard)
buildFretboard('board2', freeboard)

let LAST_FRET = 15
let strings = []

let strings2 = []

let boardsStrings = [strings, strings2]

let currentTriadDivs = []

let root
let third
let fifth

let quality
let inversion

let signage = '#'

let triadInfo = document.getElementById('triad-info')
let major = document.getElementById('maj')
let minor = document.getElementById('min')

minor.addEventListener('click', (e) => {
    if (quality != 'min') {
        let thirdIdx = currentTriadDivs.indexOf(third)
        currentTriadDivs[thirdIdx].lastElementChild.classList.remove('active')
        currentTriadDivs[thirdIdx] = third.previousElementSibling

        currentTriadDivs[thirdIdx].lastElementChild.classList.add('active')
        calcTriadType()
        updateDash()
    }
})

major.addEventListener('click', (e) => {
    if (quality != 'maj') {
        let thirdIdx = currentTriadDivs.indexOf(third)
        currentTriadDivs[thirdIdx].lastElementChild.classList.remove('active')
        currentTriadDivs[thirdIdx] = third.nextElementSibling

        currentTriadDivs[thirdIdx].lastElementChild.classList.add('active')
        calcTriadType()
        updateDash()
    }
})
const dash = document.getElementById('dash')

let chordStat = document.createElement('h3')
dash.prepend(chordStat)

function calcTriadType() {
    const firstInt = currentTriadDivs[1].abs - currentTriadDivs[0].abs
    const secInt = currentTriadDivs[2].abs - currentTriadDivs[1].abs
    const intervals = `${firstInt},${secInt}`

    currentTriadDivs.forEach((d) => {
        d.lastElementChild.classList.remove('third-color')
        d.lastElementChild.classList.remove('fifth-color')
    })

    const chordConfigs = {
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

    const config = chordConfigs[intervals]
    if (config) {
        quality = config.quality
        inversion = config.inversion

        third = currentTriadDivs[config.thirdIdx]
        third.lastElementChild.classList.toggle('third-color')

        fifth = currentTriadDivs[config.fifthIdx]
        fifth.lastElementChild.classList.toggle('fifth-color')
    } else {
        console.log('FAILED TO IDENTIFY')
    }

    let charCode = root.charCodeAt(0)

    let NextLetter = String.fromCharCode(charCode - 1) // F to G

    triadInfo.innerHTML = `<b>${root} ${quality}</b> <i>${inversion}`
    triadInfo.classList.add('fade-in')
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

// Equal temperament — normalized distance from nutZero to fret n:
function TwelfthRoot(n) {
    return 1 - Math.pow(2, -n / 12)
}

// return note letter
function absToNote(note) {
    const noteVal = note % 12 // knock down to map val
    if (signage !== 'g') {
        for (let [k, v] of noteMap.entries()) {
            if (v == noteVal) {
                return k
            }
        }
    }
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

    let abs = 0 // discrete absolute pitches (0 == Open Lo E)
    const stringGauges = [0.046, 0.036, 0.026, 0.017, 0.013, 0.01] // in inches
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
        nutZero.coord = [s, 0]
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

    const nutZero = document.createElement('div')
    nutZero.className = 'nut'
    nutZero.innerHTML = `<p>0</p>`

    fretNums.appendChild(nutZero)
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
            //
            let asLetter = absToNote(note.abs)
            noteText.innerText = asLetter
            note.appendChild(noteText)

            note.addEventListener('click', () => {
                note.lastElementChild.classList.toggle('active')
                if (boardId == 'board') {
                    note.lastElementChild.classList.toggle('active')
                    callMeBackBaby(note)
                }
            })
        })
    })
}

function invertUp(triad) {
    let lp = triad[0] // low pitch
    triad[0] = triad[1]
    triad[1] = triad[2]
    triad[2] = lp + 12
}

function invertDown(triad) {
    let hp = triad[2] // high pitch
    triad[2] = triad[1]
    triad[1] = triad[0]
    triad[0] = hp - 12
}

// sets prioritizing pos over inversion
function initTriad(cd) {
    console.log(cd.coord, cd.abs) // E on A string: [1,7], 12

    const absMajThird = cd.abs + 4
    const absFifth = cd.abs + 7

    // if two higher strings exist, attempt placing 0th maj triad
    if (cd.coord[0] + 2 < strings.length) {
        for (let f = 0; f < LAST_FRET; ++f) {
            if (strings[cd.coord[0] + 1][f].abs == absMajThird) {
                third = strings[cd.coord[0] + 1][f]
                break
            }
        }
        for (let f = 0; f < LAST_FRET; ++f) {
            if (strings[cd.coord[0] + 2][f].abs == absFifth) {
                fifth = strings[cd.coord[0] + 2][f]
                strings[cd.coord[0] + 2][f]

                root = cd.lastElementChild.innerText
                currentTriadDivs.push(cd)
                currentTriadDivs.push(third)
                currentTriadDivs.push(fifth)
                break
            }
        }

        currentTriadDivs.forEach((d) => {
            d.lastElementChild.classList.toggle('active')
        })
    }
    calcTriadType()
    updateDash()

    return
}

function setTriad(triad, off, fretDelim) {
    let offset
    if (off === undefined) {
        offset = 0
    } else offset = off

    let upOctave = false
    let invert = false
    fretDelim = 9

    while (true) {
        let coords = []
        let notesSet = 0
        for (let i = 0; i < triad.length; i++) {
            let pair // [string, fret] coord
            for (let j = 0; j < fretDelim; j++) {
                if (strings[i + offset][j].abs == triad[i]) {
                    pair = [i + offset, j]
                    notesSet++
                }
            }
            coords.push(pair)
        }

        // wonderful
        if (notesSet == 3) {
            coords.forEach((pair) => {
                let div = strings[pair[0]][pair[1]]
                currentTriadDivs.push(div)
                div.lastElementChild.classList.toggle('active') // unhide
            })
            calcTriadType()
            updateDash()
            return // get the hell outta here
        } else {
            // finding lowest possible + least inverted chord
            if (offset > 2 && !upOctave) {
                offset = 0
                upOctave = true
                triad.forEach((_, i) => {
                    triad[i] += 12
                })
                console.log(triad, 'octave++')
            } else if (offset > 2 && upOctave) {
                offset = 0
                invert = true
                triad.forEach((_, i) => {
                    triad[i] -= 12
                })
                invertUp(triad)
                console.log("i've been reborn, inverted!")
            } else {
                offset++
            }
        }
    }
}

function updateDash() {
    if (quality === 'maj') {
        major.classList.add('active')
        minor.classList.remove('active')
    } else {
        minor.classList.add('active')
        major.classList.remove('active')
    }
    console.log('quality:', quality)
}

function toggleSign() {
    let sharps
    if (strings[0][2].innerText.includes('#')) {
        sharps = true
    }
    if (sharps) {
        boardsStrings.forEach((board) => {
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j].innerText.length > 1) {
                        let letter = board[i][j].innerText[0]
                        let ascii = letter.charCodeAt(0)
                        if (letter != 'G') {
                            letter = String.fromCharCode(ascii + 1)
                        } else {
                            letter = 'A'
                        }
                        board[i][j].firstChild.innerText = letter + 'b'
                    }
                }
            }
        })
    } else {
        boardsStrings.forEach((strings) => {
            for (let i = 0; i < strings.length; i++) {
                for (let j = 0; j < strings[i].length; j++) {
                    if (strings[i][j].innerText.length > 1) {
                        let letter = strings[i][j].innerText[0]
                        let ascii = letter.charCodeAt(0)
                        if (letter != 'A') {
                            letter = String.fromCharCode(ascii - 1)
                        } else {
                            letter = 'G'
                        }
                        strings[i][j].firstChild.innerText = letter + '#'
                    }
                }
            }
        })
    }

    // update root HERE?
}

function invertTriadUp() {
    let rawAbs = []
    currentTriadDivs.forEach((div) => {
        rawAbs.push(div.abs)
        div.lastElementChild.classList.toggle('active') // unhide
    })

    invertUp(rawAbs)
    currentTriadDivs = []
    setTriad(rawAbs)
}

function invertTriadDown() {
    let rawAbs = []
    currentTriadDivs.forEach((div) => {
        rawAbs.push(div.abs)
        div.lastElementChild.classList.toggle('active') // unhide
    })

    invertDown(rawAbs)
    currentTriadDivs = []
    setTriad(rawAbs)
}

const signTog = document.getElementById('sign-tog')
signTog.addEventListener('click', (e) => {
    if (e.target.innerText.includes('b')) {
        toggleSign()
        e.target.innerText = 'sharps (#)'
    } else {
        toggleSign()
        e.target.innerText = 'flats (b)'
    }
    calcTriadType()
})

const upButton = document.getElementById('up')
upButton.addEventListener('click', () => {
    if (currentTriadDivs.length > 1) {
        invertTriadUp()
    } else {
        displayWarning()
    }
})
const downButton = document.getElementById('down')
downButton.addEventListener('click', () => {
    if (currentTriadDivs.length > 1) {
        invertTriadDown()
    } else {
        displayWarning()
    }
})

function displayWarning() {
    if (document.querySelector('.fade-out') == null) {
        const warning = document.createElement('p')
        warning.className = 'fade-out'
        warning.innerText = 'please select a note first'
        let lc = dash.lastElementChild
        dash.insertBefore(warning, lc)

        setTimeout(() => {
            warning.remove()
        }, 2000)
    }
}

// MAIN
buildFretboard('board', strings)

buildFretboard('board2', strings2)

function callMeBackBaby(clickedDiv) {
    // clear notes
    currentTriadDivs.forEach((div) => {
        div.lastElementChild.classList.toggle('active')
    })
    currentTriadDivs = []

    // let rt = getTriadAbs(clickedDiv.abs, 'MAJ')
    // setTriad(rt)
    initTriad(clickedDiv)
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'k') {
        if (currentTriadDivs.length > 1) {
            invertTriadUp()
        }
        event.preventDefault()
    }
})

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'j') {
        if (currentTriadDivs.length > 1) {
            invertTriadDown()
        }
        event.preventDefault()
    }
})

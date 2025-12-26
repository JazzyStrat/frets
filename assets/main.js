const LAST_FRET = 16
const strings = []

const noteMap = new Map([
    ['A', 5], // #
    ['A#', 6],
    ['Bb', 6],
    ['B', 7], // #
    ['C', 8],
    ['C#', 9],
    ['Db', 9],
    ['D', 10], // #
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

const emblem = '🟠'

// Equal temperament — normalized distance from nutZero to fret n:
function TwelfthRoot(n) {
    return 1 - Math.pow(2, -n / 12)
}

// return note letter
function absToNote(note) {
    const noteVal = note % 12 // knock down to map val

    let asLetter
    for (let [k, v] of noteMap.entries()) {
        if (v == noteVal) {
            asLetter = k
            // break // no fallthru, sharps
        }
    }
    // console.log('AS LETTER', asLetter)
    return asLetter
}

function buildFretboard() {
    const board = document.getElementById('board')

    const visible = TwelfthRoot(LAST_FRET)

    // calc fret widths
    const fretWidths = []
    let prev = 0
    for (let n = 1; n <= LAST_FRET; n++) {
        const dn = TwelfthRoot(n)
        const segWidth = (dn - prev) / visible // normalization
        fretWidths.push(segWidth)
        prev = dn
    }

    let abs = 0 // unique absolute pitches (0 == Open E)
    let strDia = 5
    for (let s = 0; s <= 5; s++) {
        // set string widths
        const row = document.createElement('div')
        row.className = 'string-row'

        // string diameter
        row.style.setProperty('--before-height', `${strDia}px`)
        strDia *= 0.9

        const string = []

        const nutZero = document.createElement('div')
        nutZero.className = 'nut'

        // Standard Tuning intervals - nut values
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

            if (i == fretWidths.length - 1) {
                fw.style.flex = `0 0 calc(${frac * 100}% )`
            } else {
                fw.style.flex = `0 0 ${frac * 100}%`
            }

            const dot = document.createElement('div')
            dot.className = 'marker'

            // single dot markers
            if (i % 2 == 0 && i >= 2 && i <= 8 && s == 2) {
                fw.appendChild(dot)
            }
            // 12th fret double dot markers
            if (i == 11 && (s == 1 || s == 4)) {
                if (s == 1) {
                    dot.classList.add('marker12Top')
                }
                if (s == 4) {
                    dot.classList.add('marker12Bottom')
                }
                fw.appendChild(dot)
            }
            // final 15th fret marker
            if (i == 14 && s == 2) {
                fw.appendChild(dot)
            }

            row.appendChild(fw)
        }

        strings.push(string)
        board.appendChild(row)
    }

    const fretNums = document.createElement('div')
    fretNums.id = 'fretNums'

    const nutZero = document.createElement('div')
    nutZero.className = 'nut'
    nutZero.innerHTML = `<p>0</p>`

    fretNums.appendChild(nutZero)

    // Align numbers under frets
    fretWidths.forEach((frac, i) => {
        const fretNum = document.createElement('div')
        fretNum.className = 'fretNumber'
        fretNum.style.flex = `0 0 calc(${frac * 100}% )`
        fretNum.innerHTML = `<p>${i + 1}</p>`
        fretNums.appendChild(fretNum)
    })

    board.insertAdjacentElement('afterend', fretNums)

    // add togglable notes
    strings.forEach((string) => {
        string.forEach((note) => {
            const noteText = document.createElement('p')
            noteText.classList.add('emb')
            //
            let asLetter = absToNote(note.abs)
            // // console.log('AS LETTER: ', asLetter) // flats
            noteText.innerText = asLetter
            note.appendChild(noteText)

            note.addEventListener('click', (e) => {
                noteText.classList.toggle('active')
                console.log(note.abs)
            })
        })
    })
}

// Params: Note as letter, Chord Quality, Spread (bool)
// returns lowest possible triad
function getTriad(noteLetter, quality, spread) {
    quality = quality.toUpperCase()
    noteLetter = noteLetter[0].toUpperCase() + noteLetter.slice(1)

    let root = noteMap.get(noteLetter)
    if (root === undefined) {
        console.log('ROOT IS', root)
        root = 8 // C
    }

    // default to Maj Triad
    let third = root + 4
    let fifth = third + 3

    // mutate as needed
    switch (quality) {
        case 'MIN':
            third -= 1
            break
        case 'DIM':
            third -= 1
            fifth -= 1
            break
        case 'AUG':
            fifth += 1
    }

    if (spread) {
        third += 12
    }

    let vals = [root, third, fifth]

    let sign = 'none'
    if (noteLetter.length > 1) {
        sign = noteLetter[1]
    }
    return { vals, sign }
}

function invertUp(triad) {
    let vals = triad.vals
    // console.log('inv:', triad)
    let lp = vals[0] // low pitch
    vals[0] = vals[1]
    vals[1] = vals[2]
    vals[2] = lp + 12
    // console.log(' to:', triad)
    let newTriad = { vals: vals, sign: triad.sign }
    // return newTriad
}

function invertDown(triad) {
    let vals = triad.vals
    let hp = vals[2] // high pitch
    vals[2] = vals[1]
    vals[1] = vals[0]
    vals[0] = hp - 12
    console.log('WHAT RE U', triad)
    let newTriad = { vals: vals, sign: triad.sign }
    return newTriad
}

// currently assuming notes are triad on 3 ADJACENT strings
function setTriad(triad) {
    while (true) {
        // invertUp(triad)
        // invertUp(triad)
        let offset = 0
        console.log('bigbeautifultriad', triad)
        let coords = []
        let vals = triad.vals

        // check if possible to place triad, otherwise invertUp
        let success // bool
        for (let i = 0; i < vals.length; i++) {
            if (vals[i] > 40) {
                console.log('exceeded fretboard')
                for (let i = 0; i <= vals.length; i++) {
                    vals[i] = vals[i] % 12
                    console.log(vals[i])
                }
                return
            }
            success = false
            let pair // [string, fret] coordinat:
            for (let j = 0; j < strings[i].length; j++) {
                if (strings[i + offset][j].abs == vals[i]) {
                    pair = [i + offset, j]
                    success = true
                    break
                }
            }
            coords.push(pair)
        }
        // place
        if (success) {
            coords.forEach((pair) => {
                let div = strings[pair[0]][pair[1]]
                let abs = absToNote(div.abs)
                div.lastElementChild.innerText = `${abs}`
                div.lastElementChild.classList.toggle('active') // unhide
                console.log('STATUS:', success)
            })
            return
        } else {
            offset++
            console.log('COULD NOT DO IT')
            // invert triad
            invertUp(triad)
        }
    }
    return triad
}

function removeTriad(triad) {
    let success
    triadLoop: for (let i = 0; i < triad.length; i++) {
        success = false
        for (let j = 0; j < strings[i].length; j++) {
            if (strings[i][j].abs == triad[i]) {
                strings[i][j].fret.innerText = ''
                success = true
                break
            }
        }
    }
}

function resetBoard() {}

// MAIN
buildFretboard()

let master

let t = getTriad('A', 'maj')
//
// let t = { vals: [36, 40, 43] }
// t = invertUp(t)
setTriad(t)

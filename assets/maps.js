export const triadMap = new Map([
    [
        '4,3',
        {
            quality: 'maj',
            inversion: 'root position',
            rootIdx: 0,
            thirdIdx: 1,
            fifthIdx: 2,
        },
    ],
    [
        '3,5',
        {
            quality: 'maj',
            inversion: '1st inversion',
            rootIdx: 2,
            thirdIdx: 0,
            fifthIdx: 1,
        },
    ],
    [
        '5,4',
        {
            quality: 'maj',
            inversion: '2nd inversion',
            rootIdx: 1,
            thirdIdx: 2,
            fifthIdx: 0,
        },
    ],
    [
        '3,4',
        {
            quality: 'min',
            inversion: 'root position',
            rootIdx: 0,
            thirdIdx: 1,
            fifthIdx: 2,
        },
    ],
    [
        '4,5',
        {
            quality: 'min',
            inversion: '1st inversion',
            rootIdx: 2,
            thirdIdx: 0,
            fifthIdx: 1,
        },
    ],
    [
        '5,3',
        {
            quality: 'min',
            inversion: '2nd inversion',
            rootIdx: 1,
            thirdIdx: 2,
            fifthIdx: 0,
        },
    ],
    [
        '3,3',
        {
            quality: 'dim',
            inversion: 'root position',
            rootIdx: 0,
            thirdIdx: 1,
            fifthIdx: 2,
        },
    ],
    [
        '3,6',
        {
            quality: 'dim',
            inversion: '1st inversion',
            rootIdx: 2,
            thirdIdx: 0,
            fifthIdx: 1,
        },
    ],
    [
        '6,3',
        {
            quality: 'dim',
            inversion: '2nd inversion',
            rootIdx: 1,
            thirdIdx: 2,
            fifthIdx: 0,
        },
    ],
    [
        '4,4',
        {
            quality: 'aug',
            inversion: '',
            // tho not really applicable
            rootIdx: 0,
            thirdIdx: 1,
            fifthIdx: 2,
        },
    ],
])

// maj min min maj maj min dim
//  +0  +2  +2  +1  +2  +2  +2
//  	w	w	h	w	w 	w
// could first identify what current triad is
// keep the inversion type, increment diatonically
export const diatonicWheel = [
    { q: 'maj', os: 1 },
    { q: 'min', os: 2 },
    { q: 'min', os: 2 },
    { q: 'maj', os: 1 },
    { q: 'maj', os: 2 },
    { q: 'min', os: 2 },
    { q: 'dim', os: 2 },
]

export const noteMapFlats = new Map([
    [0, 'E'],
    [1, 'F'],
    [2, 'Gb'],
    [3, 'G'],
    [4, 'Ab'],
    [5, 'A'],
    [6, 'Bb'],
    [7, 'B'],
    [8, 'C'],
    [9, 'Db'],
    [10, 'D'],
    [11, 'Eb'],
])

export const noteMapSharps = new Map([
    [0, 'E'],
    [1, 'F'],
    [2, 'F#'],
    [3, 'G'],
    [4, 'G#'],
    [5, 'A'],
    [6, 'A#'],
    [7, 'B'],
    [8, 'C'],
    [9, 'C#'],
    [10, 'D'],
    [11, 'D#'],
])

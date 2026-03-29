export const triadMap = {
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
    '3,3': {
        quality: 'dim',
        inversion: 'root position',
        thirdIdx: 1,
        fifthIdx: 2, // why does 1 break lead to null desc?
        // answer: because it forms a chord with unkeyable interval string
        // duh
    },
    '3,6': {
        quality: 'dim',
        inversion: '1st inversion',
        thirdIdx: 0,
        fifthIdx: 1,
    },
    '6,3': {
        quality: 'dim',
        inversion: '2nd inversion',
        thirdIdx: 2,
        fifthIdx: 0,
    },
    '4,4': {
        quality: 'aug',
        inversion: '',
        thirdIdx: 1,
        fifthIdx: 2,
    },
}

export const noteMap = new Map([
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

// import { quality, tri, third, fifth } from './main.js'

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

export { toMaj, toMin, toDim, toAug }

'use strict'

function nEqualCharsAtStart(a, b, max) {
  for (let i = 0; i < max; i++) {
    if (a.charCodeAt(i) !== b.charCodeAt(i)) {
      return i
    }
  }

  return max
}

function nEqualCharsAtEnd(a, b, max) {
  const aLen = a.length
  const bLen = b.length
  for (let i = 0; i < max; i++) {
    if (a.charCodeAt(aLen - i) !== b.charCodeAt(bLen - i)) {
      return i
    }
  }

  return max
}

// Since JS is synchronous, we can allocate the buffer once and keep it around
// forever. This will "leak" an array of maximum length maxDistance ... but
// it will prevent a bunch of array resizing and it will negate garbage
// collection entirely.
const _buffer = []
const _bChars = []

/**
 * Returns the Levenshtein edit distance between a and b, to a maximum of
 * `maxDistance`.
 *
 * If the distance is greater than `maxDistance`, returns Infinity.
 *
 * This special optimization speeds up calculations when the desired distance
 * is small and the string lengths aren't -- which is often, in practice.
 */
function boundedLevenshtein (a, b, maxDistance) {
  // https://en.wikipedia.org/wiki/Levenshtein_distance#Iterative_with_two_matrix_rows
  // is the simple idea. Then go to
  // https://bitbucket.org/clearer/iosifovich/src/1d27393502137b1ba788822f62f7155eb0c37744/levenshtein.h
  // for the best implementation.

  // Early optimizations
  if (a === b) return 0
  if (!a.length) return b.length > maxDistance ? Infinity : b.length
  if (!b.length) return a.length > maxDistance ? Infinity : a.length

  // Early, redundant but super-fast optimization
  if (Math.abs(a.length - b.length) > maxDistance) {
    return Infinity
  }

  // Simplify: ensure a is always the shorter string.
  // This means we can avoid some Math.max, Math.min or Math.abs calls; it
  // also makes fewer outer-loop iterations in the actual Levenshtein part
  // of the algorithm.
  if (a.length > b.length) {
    const t = a
    a = b
    b = t
  }

  let aLen = a.length
  let bLen = b.length

  // Ignore common suffix -- it does not contribute to distance
  const nSuffix = nEqualCharsAtEnd(a, b, aLen)
  aLen -= nSuffix
  bLen -= nSuffix

  // Exit really quickly if B is just A plus a prefix
  if (aLen === 0) {
    return bLen > maxDistance ? Infinity : bLen
  }

  // Slice off matching prefix -- they don't add to distance
  const nPrefix = nEqualCharsAtStart(a, b, aLen)
  aLen -= nPrefix
  bLen -= nPrefix

  // Exit really quickly if B is just A plus a prefix and suffix
  if (aLen === 0) {
    return bLen > maxDistance ? Infinity : bLen
  }

  // Run .charCodeAt() once, instead of in the inner loop
  for (let i = 0; i < bLen; i++) {
    _bChars[i] = b.charCodeAt(nPrefix + i)
  }

  // Initialize buffer
  // Unlike in Wikipedia's Levenshtein algorithm, we set buffer to length bLen,
  // not bLen+1. We dont insert the first element because we can infer it from
  // `i` in our main Levenshtein loop
  for (let i = 0; i < bLen; i++) {
    _buffer[i] = i + 1
  }

  // Idea copied from talisman's max-distance Levenshtein: we can avoid some
  // comparisons that would only ever lead to distance > maxDistance.
  if (maxDistance > bLen) maxDistance = bLen
  const offset = maxDistance - (bLen - aLen)
  let jStart = 0
  let jEnd = maxDistance

  for (let i = 0; i < aLen; i++) {
    let rowMinimum = bLen
    const ac = a.charCodeAt(nPrefix + i)

    // We don't need to compare the _entire_
    if (i > offset) jStart += 1
    if (jEnd < bLen) jEnd += 1

    // Calculate v1 (current distances) from previous row v0
    // First distance is delete (i + 1) chars from a to match empty b
    let current = i
    let left = i + 1

    for (let j = jStart; j < jEnd; j++) {
      const bc = _bChars[j]

      const insertDeleteCost = Math.min(left, _buffer[j]) + 1
      const substituteCost = (ac === bc) ? 0 : 1

      const d = Math.min(insertDeleteCost, current + substituteCost)

      if (d < rowMinimum) {
        rowMinimum = d
      }

      current = _buffer[j]
      left = _buffer[j] = d
    }

    if (rowMinimum > maxDistance) {
      // We never _subtract_ from any row values, so it's impossible for the
      // edit distance to be smaller than or equal to maxDistance.
      return Infinity
    }
  }

  return _buffer[bLen - 1]
}

module.exports = boundedLevenshtein

'use strict'

/**
 * Returns the Levenshtein edit distance between a and b, to a maximum of
 * `maxDistance`.
 *
 * If the distance is greater than `maxDistance`, returns `maxDistance + 1`
 *
 * This special optimization speeds up calculations when the desired distance
 * is small and the string lengths aren't -- which is often, in practice.
 */
function boundedLevenshtein (a, b, maxDistance) {
  if (maxDistance > 255) {
    throw new Exception("Cannot set maxDistance greater than 255")
  }

  // https://en.wikipedia.org/wiki/Levenshtein_distance#Iterative_with_two_matrix_rows
  // is the simple idea. Then go to
  // https://bitbucket.org/clearer/iosifovich/src/1d27393502137b1ba788822f62f7155eb0c37744/levenshtein.h
  // for the best implementation.

  // Simplify: ensure a.length <= b.length by swapping
  if (a.length > b.length) {
    const t = a
    a = b
    b = t
  }

  // Slice off matching beginnings -- they don't contribute to distance
  let i = 0
  while (i < a.length && a.charCodeAt(i) === b.charCodeAt(i)) {
    i += 1
  }
  a = a.slice(i)
  b = b.slice(i)

  const aLen = a.length
  const bLen = b.length

  // Exit really quickly if zero length
  if (aLen === 0) {
    return Math.min(bLen, maxDistance + 1)
  }

  const buffer = new Uint8Array(bLen + 1)
  // Initialize buffer
  for (let i = 0; i <= bLen; i++) {
    buffer[i] = i
  }

  for (let i = 1; i < aLen + 1; i++) {
    let rowMinimum = bLen

    // Calculate v1 (current distances) from previous row v0
    // First distance is delete (i + 1) chars from a to match empty b
    let temp = buffer[0]
    buffer[0] += 1

    for (let j = 1; j <= bLen; j++) {
      const insertionCost = buffer[j] + 1
      const deletionCost = buffer[j - 1] + 1
      const substitutionCost = (a.charCodeAt(i - 1) === b.charCodeAt(j - 1)) ? 0 : 1

      const d = Math.min(deletionCost, insertionCost, temp + substitutionCost)

      if (d < rowMinimum) {
        rowMinimum = d
      }

      temp = buffer[j]
      buffer[j] = d
    }

    if (rowMinimum > maxDistance) {
      // We never _subtract_ from any row values, so it's impossible for the
      // edit distance to be smaller than or equal to maxDistance.
      return maxDistance + 1
    }
  }

  return buffer[bLen]
}

module.exports = boundedLevenshtein

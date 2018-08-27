'use strict'

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

  // Early, redundant but super-fast optimization
  if (Math.abs(a.length - b.length) > maxDistance) {
    return Infinity
  }

  // Simplify: ensure a.length <= b.length by swapping
  if (a.length > b.length) {
    const t = a
    a = b
    b = t
  }

  // Slice off matching beginnings -- they don't contribute to distance
  let minLen = Math.min(a.length, b.length)
  let start
  for (start = 0; start < minLen && a.charCodeAt(start) === b.charCodeAt(start); start++) {
    // keep incrementing
  }

  let aLen = a.length - start
  let bLen = b.length - start
  // Slice off matching suffixes (all we need to do is fiddle with index)
  while (aLen > 0 && a.charCodeAt(start + aLen - 1) === b.charCodeAt(start + bLen - 1)) {
    aLen -= 1
    bLen -= 1
  }

  // Exit really quickly if all of a matches parts of b
  if (aLen === 0) {
    return bLen > maxDistance ? Infinity : bLen
  }

  const bChars = []
  // Run .charCodeAt() once, instead of in the inner loop
  for (let i = 0; i < bLen; i++) {
    bChars.push(b.charCodeAt(start + i))
  }

  const buffer = []
  // Initialize buffer
  for (let i = 0; i <= bLen; i++) {
    buffer.push(i)
  }

  for (let i = 1; i < aLen + 1; i++) {
    let rowMinimum = bLen
    const ac = a.charCodeAt(start + i - 1)

    // Calculate v1 (current distances) from previous row v0
    // First distance is delete (i + 1) chars from a to match empty b
    buffer[0] = i
    let above = i - 1

    for (let j = 0; j < bLen; j++) {
      const insertDeleteCost = Math.min(buffer[j], buffer[j + 1]) + 1
      const substituteCost = (ac === bChars[j]) ? 0 : 1

      const d = Math.min(insertDeleteCost, above + substituteCost)

      if (d < rowMinimum) {
        rowMinimum = d
      }

      above = buffer[j + 1]
      buffer[j + 1] = d
    }

    if (rowMinimum > maxDistance) {
      // We never _subtract_ from any row values, so it's impossible for the
      // edit distance to be smaller than or equal to maxDistance.
      return Infinity
    }
  }

  return buffer[bLen]
}

module.exports = boundedLevenshtein

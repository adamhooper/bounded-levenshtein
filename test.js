import test from 'ava'
import boundedLevenshtein from './index'

const MaxDistance = 12

function d (a, b) {
  return boundedLevenshtein(a, b, MaxDistance)
}

test(t => {
  t.is(d('equal', 'equal'), 0)
  t.is(d('add at end', 'add at endx'), 1)
  t.is(d('diff at end', 'diff at ene'), 1)
  t.is(d('nix at end', 'nix at en'), 1)
  t.is(d('add at start', 'xadd at start'), 1)
  t.is(d('diff at start', 'eiff at start'), 1)
  t.is(d('nix at start', 'ix at start'), 1)
  t.is(d('add in middle', 'add xin middle'), 1)
  t.is(d('diff in middle', 'diff ix middle'), 1)
  t.is(d('nix in middle', 'nix n middle'), 1)
  t.is(d('right empty', ''), 11)
  t.is(d('nix at end', 'nix at end and we exceed MaxDistance'), Infinity)
  t.is(d('exceeds MaxDistance and thus is bounded', 'MaxDistance was exceeded so we bound this'), Infinity)
  t.is(d('', 'left empty'), 10)
  t.is(d('accentś', 'accėnts'), 2)
})

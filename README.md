bounded-levenshtein
===================

Find the maximum distance between two JavaScript Strings, or `Infinity`.

Sources
-------

* [Wikipedia](https://en.wikipedia.org/wiki/Levenshtein_distance)
* [Talisman](https://github.com/Yomguithereal/talisman/blob/master/src/metrics/distance/levenshtein.js),
  which is faster for tiny strings but is always packaged as four functions
  instead of one.
* [js-levenshtein](https://github.com/gustf/js-levenshtein), which has great
  benchmarks and is super-fast for small strings but doesn't accept a
  `maxDistance` and therefore has maximum running time `O(aLength * bLength)`
  instead of ours, `O(max(aLength, bLength) * maxDistance)`.

This module's `bench.js` is stolen from js-levenshtein.

We ought to steal js-levenshtein's loop-unrolling idea. (It compares four
characters at a time.) Right now we're simpler than that.

Benchmark
=========

Benchmarked on 2018-08-27 on an Intel i7-4650U:

```
bounded-levenshtein (master *>)$ npm run bench
> bounded-levenshtein@0.0.1 bench /home/adam/src/cjworkbench/bounded-levenshtein
> matcha bench.js
                      50 paragraphs, length max=500 min=240 avr=372.5
         326,508 op/s » bounded-levenshtein
             100 op/s » js-levenshtein
         162,595 op/s » talisman
              59 op/s » levenshtein-edit-distance
              53 op/s » leven
              36 op/s » fast-levenshtein
                      100 sentences, length max=170 min=6 avr=57.5
          62,220 op/s » bounded-levenshtein
           1,936 op/s » js-levenshtein
          28,112 op/s » talisman
           1,191 op/s » levenshtein-edit-distance
           1,101 op/s » leven
             780 op/s » fast-levenshtein
                      2000 words, length max=20 min=3 avr=9.5
           1,254 op/s » bounded-levenshtein
           2,130 op/s » js-levenshtein
           1,462 op/s » talisman
           1,351 op/s » levenshtein-edit-distance
           1,460 op/s » leven
           1,208 op/s » fast-levenshtein
  Suites:  3
  Benches: 18
  Elapsed: 18,250.62 ms
```

In short: `bounded-levenshtein` runs much faster in the worst case. That makes
it safer to use when you don't know much about what the input will be.

Developing
==========

```bash
npm install
npm test -- --watch             # runs tests continuously
npm run-script build -- --watch # builds continuously
npm run bench                   # benchmark!
```

Pick a feature; write a test; make it pass; commit.

Deploying
---------

1. Update `version` in `package.json`
1. `npm install` to update `package-lock.json`
1. `git commit -am 'vx.x.x && git tag vx.x.x && git push && git push origin vx.x.x`
1. `npm publish`

'use strict'
const hrtime = require('browser-process-hrtime')

/**
* IPFS player utils
*/

const utils = {
  // duration, calcRates and speed are from goga-m's ipfs benchmark
  duration: (start) => {
    const nsPerSec = 1e9
    const time = hrtime(start)
    // In seconds
    return (time[0] * nsPerSec + time[1]) / nsPerSec
  },
  calcRates: (rates) => {
    rates.sort(function (a, b) {
      if (a > b) return 1
      else if (a === b) return 0
      return -1
    })
    const min = rates[0] || 0
    const max = rates[rates.length - 1] || 0
    const avg = rates.reduce((p, c) => p + c, 0) / rates.length || 0

    const middle = Math.floor(rates.length / 2)
    const isEven = rates.length % 2 === 0
    const median = isEven
      ? (rates[middle] + rates[middle - 1]) / 2 || 0
      : rates[middle] || 0

    return {
      min,
      max,
      median,
      avg
    }
  },
  speed: (size, time) => {
    if (size === 0) return 0
    return Math.round(size / (time || 1))
  }
}

module.exports = utils

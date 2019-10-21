'use strict'

const EOL = require('os').EOL
const options = {
  forceServerObjectId: true,
  upsert: true
}

module.exports = function makeUpsert (showErrors, showStdout) {
  let callback

  if (showErrors && showStdout) {
    callback = function (e, result) {
      if (e) {
        console.error(e)
      } else {
        process.stdout.write(JSON.stringify(result.ops[0]) + EOL)
      }
    }
  } else if (showErrors && !showStdout) {
    callback = function (e) {
      if (e) {
        console.error(e)
      }
    }
  } else if (!showErrors && showStdout) {
    callback = function (e, result) {
      if (!e) {
        process.stdout.write(JSON.stringify(result.ops[0]) + EOL)
      }
    }
  }

  return function upsert (collection, key, log) {
    collection.updateOne(key, log, options, callback)
  }
}

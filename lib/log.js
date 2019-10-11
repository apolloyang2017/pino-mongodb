'use strict'

module.exports = function log (data) {
  let log

  try {
    log = JSON.parse(data)

    if (log.time) {
      log.time = new Date(log.time)
    }
    //following add by apollo.yang
    if (log.type == "gateway") {
            log.secret = "9aec845df6dc451cbf3853aab8a8f962"
    } else {
            log.secret = "iSurpass2018"
            log.salt = "iSurpass"
    }
    log.issuper = false
    log.clientid = log.deviceid
  } catch (e) {
    log = {
      msg: data
    }
  }

  return log
}

'use strict'

module.exports = function log (data) {
  let log

  try {
    log = JSON.parse(data)

    if (log.time) {
      log.time = new Date(log.time)
    }
    //following add by apollo.yang
    if (log.type === "gateway") {
            log.secret = "9aec845df6dc451cbf3853aab8a8f962"
    } else {
            if (log.isbluetoothlock === true) {
              log.bluetooth_secret = log.secret
            }
            if (log.type != "tcpgateway") {
              log.secret = "iSurpass2018"
              log.salt = "iSurpass"
            }  
    }
    if (log.isbluetoothlock === true) {
      log.bluetooth_user_secret = log.bluetooth_user_secret0
      log.bluetooth_data_secret = log.bluetooth_data_secret0
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

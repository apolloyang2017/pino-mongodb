#!/usr/bin/env node
'use strict'

const carrier = require('carrier')
const program = require('commander')
const MongoClient = require('mongodb').MongoClient
const parseMongoUrl = require('muri')
const log = require('./lib/log')
const pkg = require('./package.json')
////const makeInsert = require('./lib/makeInsert')
const makeUpsert = require('./lib/makeUpsert')

program
  .version(pkg.version)
  .description(pkg.description)
  .arguments('[mongo-url]')
  .option('-c, --collection <name>', 'database collection', 'logs')
  .option('-o, --stdout', 'output inserted documents into stdout', false)
  .option('-e, --errors', 'output insertion errors into stderr', false)
  .parse(process.argv)

const mongoUrl = (program.args[0] || 'mongodb://localhost:27017/logs')

function handleConnection (e, mClient) {
  if (e) {
    throw e
  }

  const dbName = parseMongoUrl(mongoUrl).db

  const db = mClient.db(dbName)
  const emitter = carrier.carry(process.stdin)
  const collection = db.collection(program.collection)
  ////const insert = makeInsert(program.errors, program.stdout)
  const upsert = makeUpsert(program.errors, program.stdout)

  emitter.on('line', (line) => {
    ////insert(collection, log(line))
    var l = log(line)
    //if (program.collection == "mqttuser") {
      upsert(collection, {"clientid": l.deviceid}, {"$set":l})
      if (l.type == 'lockgateway') {
        var ts = Math.round(new Date().getTime()/1000)
        upsert(db.collection("device"), {"_deviceid": l.deviceid}, {"$set":{"_appkey": l.appkey || "iSurpassApp", "_deviceid": l.deviceid, "_isvirtual": true, "_create_ts": ts}})
        upsert(db.collection("node"), {"_deviceid": l.deviceid, "_nodeid": 1}, {"$set":{"_appkey": l.appkey || "iSurpassApp", "_deviceid": l.deviceid, "_nodeid": 1, "_logicid": l.deviceid+"-1-0-", "_isentity": true, "_islogic": true, "_nodetype": "lock", "_logicnodetype": "lock", "_create_ts": ts}})
      }
      if (l.deviceid.indexOf("iTCP") == 0) {
        var ts = Math.round(new Date().getTime()/1000)
        upsert(db.collection("device"), {"_deviceid": l.deviceid}, {"$set":{"_appkey": l.appkey || "iSurpassApp", "_deviceid": l.deviceid, "_isvirtual": false, "_create_ts": ts}})          
      }
    //}
  })

  process.on('SIGINT', () => {
    mClient.close(process.exit)
  })
}

MongoClient.connect(
  mongoUrl,
  { useNewUrlParser: true },
  handleConnection
)

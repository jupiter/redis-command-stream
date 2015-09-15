'use strict'
var argv = require('minimist')(process.argv.slice(2), {
  default: {
    h: '127.0.0.1',
    p: 6379,
    n: 1,
    a: null
  }
})

if (argv.help) {
  console.log('redis-command-stream ' + require('../package').version)
  console.log(require('fs').readFileSync(require('path').join(__dirname, '../help.txt')).toString())
  process.exit()
}

var async = require('async')
var redis = require('redis')
var client

var options = {
  auth_pass: argv.a
}

if (argv.s) {
  client = redis.createClient(argv.s, options)
} else {
  client = redis.createClient(argv.p, argv.h, options)
}

client.select(argv.n)


var opsByType = {
  string: function(key, cb) {
    client.get(key, function(err, value) {
      if (err) return cb(err)

      put(['SET', escape(key), escape(value)])
      cb()
    })
  },

  list: function(key, cb) {
    client.lrange(key, 0, -1, function(err, values) {
      if (err) return cb(err)

      put(['DEL', escape(key)])
      put(['RPUSH', escape(key)].concat(values.map(mapEscapeFn)))
      cb()
    })
  },

  set: function(key, cb) {
    client.smembers(key, function(err, values) {
      if (err) return cb(err)

      put(['DEL', escape(key)])
      if (!values.length) return cb()

      put(['SADD', escape(key)].concat(values.map(mapEscapeFn)))
      cb()
    })
  },

  zset: function(key, cb) {
    client.zrange(key, 0, -1, 'withscores', function(err, values) {
      if (err) return cb(err)

      put(['DEL', escape(key)])
      if (!values.length) return cb()

      var arr = ['ZADD', escape(key)]
      var i = 0

      while (i < values.length) {
        arr.push(values[i + 1])
        arr.push(escape(values[i]))
        i += 2
      }

      put(arr)
      cb()
    })
  },

  hash: function(key, cb) {
    client.hgetall(key, function(err, values) {
      if (err) return cb(err)

      put(['DEL', escape(key)])

      var keys = Object.keys(values)
      if (!keys.length) return cb()

      var arr = ['HMSET', escape(key)]

      keys.forEach(function(key) {
        arr.push(escape(key))
        arr.push(escape(values[key]))
      })

      put(arr)
      cb()
    })
  }
}

client.keys(argv._[0] || '*', function(err, keys) {
  if (err) return end(err)

  async.forEachSeries(keys, function(key, next) {

    client
    .multi()
    .type(key)
    .ttl(key)
    .exec(function(err, replies) {
      if (err) return next(err)

      var type = replies[0]
      var ttl = parseInt(replies[1], 10)

      var op = opsByType[type]

      if (!op) return next()
      if (ttl < 0) return op(key, next)

      // Set TTL
      op(key, function(err) {
        if (err) return next(err)

        put(['EXPIRE', escape(key), ttl])
        next()
      })
    })
  }, end)
})

function put(arr) {
  // console.log('ECHO ' + escape(arr.join(' '))) // Debug
  console.log(arr.join(' '))
}

function end(err) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  process.exit()
}

function escape(str) {
  return '"' + str.replace(/\\/g, '\\\\').replace(/\"/g, '\\"') + '"'
}

function mapEscapeFn(val) {
  return escape(val)
}

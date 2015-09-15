# redis-stream
Dump a Redis database as a stream of commands

## Install

```
npm install -g redis-stream
```

## Use

```
$ redis-stream --help

Usage: redis-stream [OPTIONS] [key pattern]
  -h <hostname>      Server hostname (default: 127.0.0.1).
  -p <port>          Server port (default: 6379).
  -s <socket>        Server socket (overrides hostname and port).
  -a <password>      Password to use when connecting to the server.
  -n <db>            Database number.

Examples:
  redis-stream -n 5 "hotel*" | redis-cli -n 6
  redis-stream -n 5 "hotel*" > export.txt
  (cat export.txt | redis-cli -n 6)
```

## License

MIT

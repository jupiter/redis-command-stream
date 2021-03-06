# redis-command-stream
Dump a Redis database as a stream of commands

## Install

```
npm install -g redis-command-stream
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
  --pipe             Output in protocol format for piping to redis-cli.
  --flushdb          Insert command to empty the destination database.

Examples:
  redis-stream -n 5 "hotel*" > export.txt
  redis-stream -n 5 --pipe "hotel*" | redis-cli -n 6 --pipe
  redis-stream -n 5 --pipe "hotel*" > export.txt
  (cat export.txt | redis-cli -n 6 --pipe)
```

## License

MIT

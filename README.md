# aws-kinesis-dump

Dumps periodically (each 5 seconds) records from all shards of the specified [AWS Kinesis Stream](https://aws.amazon.com/kinesis/streams/).
Maybe usefully for monitoring and/or debugging your streams.

Installation:
```sh
npm i # or yarn
```

All you need to do is to define StreamName in the config.js.

To run it just execute node index.js.

```sh
node index.js
```

You can pipe result into bunyan for better visual representation.

```sh
node index.js | node_modules/.bin/bunyan
```

Or even better if you familiar with [`jq`](https://stedolan.github.io/jq/) tool pipe it
there and enjoy quering JSON output like a boss.

```sh
node index.js | jq "."
```


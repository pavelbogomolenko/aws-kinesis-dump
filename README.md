# aws-kinesis-dump

Dumps periidically (each 5 seconds) records from all shards of the specified [AWS Kinesis Stream](https://aws.amazon.com/kinesis/streams/).
Maybe usefully for monitoring and/or debugging your streams.

All you need to do is to define StreamName in the config.js.

To run it just execute node index.js.

```sh
node index.js
```

You can pipe result into bunyan for better visual representation.

```sh
node index.js | node_modules/.bin/bunyan
```

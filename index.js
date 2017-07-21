const _ = require('lodash');
const AWS = require('aws-sdk');
const Promise = require('bluebird');
const bunyan = require('bunyan');
const moment = require('moment');

const config = require('./config');

const async = Promise.coroutine;

const INTERVAL = 5;

const logger = bunyan.createLogger({
  name: 'kinesis-dump'
});

AWS.config.update(config.aws);

const kinesis = new AWS.Kinesis({
  apiVersion: '2013-12-02'
});

const logRecords = (recordsData) => {
  _.get(recordsData, 'Records', [])
  .forEach((record) => {
    const data = new Buffer(record.Data, 'base64').toString();
    logger.info(data);
  });
}

const dumpStream = async(function* (streamConfig) {
  const streamDescriptionResponse = yield kinesis.describeStream(params).promise();
  logger.info(streamDescriptionResponse);

  const shards = _.get(streamDescriptionResponse, 'StreamDescription.Shards');

  const recordsPromises = shards.map(shard => {
    return kinesis.getShardIterator({
        ShardId: shard.ShardId,
        ShardIteratorType: 'AT_TIMESTAMP',
        StreamName: streamConfig.StreamName,
        Timestamp: moment().subtract(INTERVAL, 'seconds').unix()
      }).promise()
      .then(shardIteratorResponse => kinesis.getRecords(shardIteratorResponse).promise());
  });

  const allResults = yield Promise.all(recordsPromises);
  allResults.forEach(results => logRecords(results));
});

const params = config.kinesis;

setInterval(() => dumpStream(params), INTERVAL * 1000);

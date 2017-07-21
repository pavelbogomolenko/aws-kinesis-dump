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

const logRecords = (data) => {
  const dataWithoutRecords = _.omit(data, 'Records');
  const records = _.get(data, 'Records', []);
  if(_.size(records)) {
    return records.forEach((record) => {
        const base64String = new Buffer(record.Data, 'base64').toString();
        try {
          logger.info(_.extend({record: JSON.parse(base64String)}, dataWithoutRecords));
        } catch(e) {
          logger.info(_.extend({record: base64String}, dataWithoutRecords));
        }
      });
  }

  return logger.info(dataWithoutRecords);
}

const dumpStream = async(function* (streamConfig) {
  const streamDescriptionResponse = yield kinesis.describeStream(params).promise();

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
  allResults.forEach(results => logRecords(_.extend(results, streamDescriptionResponse)));
});

const params = config.kinesis;

setInterval(() => dumpStream(params), INTERVAL * 1000);

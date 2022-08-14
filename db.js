const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const REGION = "us-east-1";
const client = new DynamoDBClient({ region: REGION });

module.exports = client;

const { DynamoDBClient } = require("@aws-sdk/client-dybamodb");
const client = new DynamoDBClient({});

module.exports = client;

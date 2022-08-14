"use strict";

const { sendResponse } = require("../functions/index");
const dynamoDb = require("../db");

module.exports.getHero = async (event) => {
  try {
    const params = {
      Key: {
        id: event.pathParameters.id,
      },
      TableName: process.env.DYNAMO_TABLE_NAME,
    };

    // const params = {
    //   TableName: process.env.DYNAMO_TABLE_NAME,
    //   KeyConditionExpression: "id = :id",
    //   ExpressionAttributeValues: {
    //     ":id": id,
    //   },
    //   Select: "ALL_ATTRIBUTES",
    // };

    const data = await dynamoDb.get(params).promise();
    if (data) {
      return sendResponse(200, { item: data.Item });
    } else {
      return sendResponse(404, { message: "Hero not found" });
    }
  } catch (e) {
    return sendResponse(500, {
      error: e.message,
      message: "Could not get the hero",
    });
  }
};

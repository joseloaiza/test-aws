"use strict";

const { sendResponse } = require("../functions/index");
const dynamoDb = require("../db");

module.exports.updateHero = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const { name, alias, specie, companyName, companyTeam, id } = body;
    const params = {
      TableName: process.env.DYNAMO_TABLE_NAME,
      Key: {
        id,
      },
      ExpressionAttributeValues: {
        ":name": name,
        ":alias": alias,
        ":specie": specie,
        ":companyName": companyName,
        ":companyTeam": companyTeam,
      },
      UpdateExpression:
        "SET name = :name, alias = :alias, specie = :specie, companyName = :companyName, companyTeam = :companyTeam",
      ReturnValues: "ALL_NEW",
    };

    const data = await dynamoDb.update(params).promise();
    if (data.Attributes) {
      return sendResponse(200, data.Attributes);
    } else {
      return sendResponse(404, { message: "Updated hero data not found" });
    }
  } catch (e) {
    return sendResponse(500, {
      error: e.message,
      message: "Could not update this hero",
    });
  }
};

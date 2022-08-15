"use strict";
const dynamoDb = require("../db");
const { sendResponse } = require("../functions/index");
const { v4: uuidv4 } = require("uuid");

module.exports.createHero = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { heroName, alias, specie, companyName, companyTeam } = body;
    if (
      !body.heroName ||
      body.heroName.trim() === "" ||
      !body.companyName ||
      body.companyName.trim() === ""
    ) {
      return sendResponse(200, {
        message: "Please enter a name and company name",
      });
    }

    const id = uuidv4();
    const TableName = process.env.DYNAMO_TABLE_NAME;
    const params = {
      TableName,
      Item: {
        id,
        heroName,
        alias,
        specie,
        companyName,
        companyTeam,
      },
      ConditionExpression: "attribute_not_exists(id)",
    };
    await dynamoDb.put(params).promise();
    return sendResponse(200, { message: "Hero created successfully" });
  } catch (e) {
    return sendResponse(500, { message: "Could not create the hero" });
  }
};

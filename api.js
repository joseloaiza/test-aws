const db = require("./db");
const { v4: uuidv4 } = require("uuid");
const {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  CreateTableCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getHero = async (event) => {
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.HEROES_TABLE,
      Key: marshall({ id: event.pathParameters.id }),
    };
    const item = await db.send(new GetItemCommand(params));
    console.log(item);
    response.body = JSON.stringify({
      messsage: "Succesfully retrieved hero",
      data: item,
      rawData: item,
    });
  } catch (error) {
    console.log(error);
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "Failed to retrieve hero",
      errorMsg: error.messsage,
      errorStack: error.stack,
    });
  }
  return response;
};

const createHero = async (event) => {
  const response = { statusCode: 200 };

  try {
    const hero = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      name: event.body.name,
      alias: event.body.alias,
      species: event.body.species,
      companyName: event.body.companyName,
      companyTeam: event.body.companyTeam,
    };
    //const body = JSON.parse(event.body);

    const params = {
      TableName: process.env.HEROES_TABLE,
      Item: hero,
    };
    const createResult = await db.send(new PutItemCommand(params));

    response.body = JSON.stringify({
      messsage: "Succesfully created hero",
      createResult,
    });
  } catch (error) {
    console.log(error);
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "Failed to created hero",
      errorMsg: error.messsage,
      errorStack: error.stack,
    });
  }
  return response;
};

const deleteHero = async (event) => {
  const response = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.HEROES_TABLE,
      Key: marshall({ id: event.pathParameters.id }),
    };
    const deleteResult = await db.send(new DeleteItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully deleted hero.",
      deleteResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to delete hero.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

const getAllHeroes = async () => {
  const response = { statusCode: 200 };

  try {
    const { Items } = await db.send(
      new ScanCommand({ TableName: process.env.HEROES_TABLE })
    );

    response.body = JSON.stringify({
      message: "Successfully retrieved all heroes.",
      data: Items.map((item) => unmarshall(item)),
      Items,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to retrieve heroes.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  getHero,
  createHero,
  deleteHero,
  getAllHeroes,
};

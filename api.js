const db = require("./db");
const {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getCustomer = async (event) => {
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.CUSTOMERS_TABLE,
      Key: marshall({ customerId: event.pathParameters.customerId }),
    };
    const item = await db.send(new GetItemCommand(params));
    console.log(Item);
    response.body = JSON.stringify({
      messsage: "Succesfully retrieved customer",
      data: item ? unmarshall(item) : {},
      rawData: item,
    });
  } catch (error) {
    console.log(error);
    response.statusCode = 400;
    res.body = JSON.stringify({
      message: "Failed to retrieve customer",
      errorMsg: error.messsage,
      errorStack: error.stack,
    });
  }
  return response;
};

const createCustomer = async (event) => {
  const response = { statusCode: 200 };
  try {
    const customer = {
      customerId: uuid(),
      createdAt: new Date().toISOString(),
      name: reqBody.name,
      alias: reqBody.alias,
      species: reqBody.species,
      title: reqBody.title,
      companyName: reqBody.companyName,
      companyTeam: reqBody.companyTeam,
    };
    //const body = JSON.parse(event.body);

    const params = {
      TableName: process.env.CUSTOMERS_TABLE,
      Item: marshall(customer || {}),
    };
    const createResult = await db.send(new PutItemCommand(params));

    response.body = JSON.stringify({
      messsage: "Succesfully created customer",
      createResult,
    });
  } catch (error) {
    console.log(error);
    response.statusCode = 400;
    res.body = JSON.stringify({
      message: "Failed to created customer",
      errorMsg: error.messsage,
      errorStack: error.stack,
    });
  }
  return response;
};

const deleteCustomer = async (event) => {
  const response = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.CUSTOMERS_TABLE,
      Key: marshall({ postId: event.pathParameters.customerId }),
    };
    const deleteResult = await db.send(new DeleteItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully deleted customer.",
      deleteResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to delete customer.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

const getAllCustomer = async () => {
  const response = { statusCode: 200 };

  try {
    const { Items } = await db.send(
      new ScanCommand({ TableName: process.env.CUSTOMERS_TABLE })
    );

    response.body = JSON.stringify({
      message: "Successfully retrieved all customers.",
      data: Items.map((item) => unmarshall(item)),
      Items,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to retrieve customers.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  getCustomer,
  createCustomer,
  deleteCustomer,
  getAllCustomer,
};

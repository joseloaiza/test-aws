const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const SES = new AWS.SES({ region: process.env.REGION });
const moment = require("moment");
const fileType = require("file-type");
const fs = require("fs");

const filepath = "";
const bucketName = "testpayroll";

module.exports.uploadfile = async (event, context) => {
  let request = event.body;
  //get the request
  let base64String = request.base64String;
  //pass the base64String into a buffer
  let buffer = Buffer.from(base64String, "base64");
  let fileMime = fileType(buffer);
  if (fileMime === null) {
    return context.fail("The string supplid is no file type ");
  }

  let file = getFile(fileMime, buffer);
  let params = file.params;

  S3.putObject(params, function (err, data) {
    if (err) {
      return console.log("err");
    }
    return console.log("file url" + file.fullpath);
  });
};

let getFile = function (fileMime, buffer) {
  let fileExt = fileMime.ext;
  let hash = sha1(Buffer.from(new Date().toString()));
  let now = moment().format("YYYY-MM-DD HH:mm:ss");

  let filePath = hash + "/";
  let fileName = unixTime(now) + "." + fileExt;
  let fileFulllName = filePath + fileName;
  let filefullPath = process.env.BUCKET_NAME_UPLOAD + fileFulllName;

  let params = {
    Bucket: process.env.BUCKET_NAME_UPLOAD,
    Key: fileFulllName,
    Body: buffer,
  };

  let uploadfile = {
    size: buffer.toString("ascii").length,
    type: fileMime.mime,
    name: fileName,
    full_path: filefullPath,
  };

  return {
    params: params,
    uploadfile: uploadfile,
  };
};

import { Handler } from "@netlify/functions";
import { readDogos } from "./readDogos";
import { createDogos } from "./createDogos";
import { updateDogo } from "./updateDogo";

const handler: Handler = (event, context, callback) => {
  switch (event.httpMethod) {
    case "GET":
      return readDogos(event, context, callback);
      break;
    case "POST":
      return createDogos(event, context, callback);
      break;
    case "PUT":
      return updateDogo(event, context, callback);
      break;
  }

  return { statusCode: 501 };
};

export { handler };

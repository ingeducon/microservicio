import { Handler } from "@netlify/functions";
import { connectDatabase } from "../../db";
import { DogoModel } from "../../models/DogoModel";

export const createDogos: Handler = async (context, event) => {
  try {
    if (context.headers["content-type"] !== "application/json") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid content type, expected application/json",
        }),
      };
    }

    const { body } = context;
    const parsedBody = body && body.length > 0 ? JSON.parse(body) : null;

    if (parsedBody && "name" in parsedBody && "imageURL" in parsedBody) {
      await connectDatabase();

      const newDogo = new DogoModel({
        name: parsedBody.name,
        imageURL: parsedBody.imageURL,
        age: parsedBody.age,
      });

      await newDogo.save();

      return {
        statusCode: 200,
        body: JSON.stringify({
          dogo: newDogo,
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid input, name and imageURL are required",
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error,
      }),
    };
  }
};

import { Handler } from "@netlify/functions";
import { connectDatabase } from "../../db";
import { DogoModel } from "../../models/DogoModel";

export const readDogos: Handler = async (context, event) => {
  try {
    if (context.headers["content-type"] !== "application/json") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid content type, expected application/json",
        }),
      };
    }

    await connectDatabase();

    const newMedico = await DogoModel.find({});

    return {
      statusCode: 200,
      body: JSON.stringify({
        medicos: newMedico,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error,
      }),
    };
  }
};

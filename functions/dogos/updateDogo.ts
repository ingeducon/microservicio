import { Handler } from "@netlify/functions";
import { connectDatabase } from "../../db";
import { DogoModel } from "../../models/DogoModel";

export const updateDogo: Handler = async (context, event) => {
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

    if (parsedBody && "idDogo" in parsedBody) {
      await connectDatabase();
      const idDogo = parsedBody.idDogo;
      const dogo = await DogoModel.findById(idDogo);
      if (dogo) {
        const newName = parsedBody.name ? parsedBody.name : dogo.name;
        const newImage = parsedBody.imageURL
          ? parsedBody.imageURL
          : dogo.imageURL;
        const newAge = parsedBody.age ? parsedBody.age : dogo.age;
        await dogo
          .set({
            name: newName,
            lastName: newImage,
            address: newAge,
          })
          .save();
        return {
          statusCode: 200,
          body: JSON.stringify({
            dogo: dogo,
          }),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "No se encuentra el registro a actualizar",
          }),
        };
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid input, idDogo is required",
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

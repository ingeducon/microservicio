import { Handler } from "@netlify/functions";
import fetch from "node-fetch";

export const readDogos: Handler = async (context, event) => {
  const response = await fetch("https://random.dog/doggos");
  const data = await response.json();

  if (Array.isArray(data)) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        dogs: {
          images: data.slice(0, 10).map((url) => `https://random.dog/${url}`),
        },
      }),
    };
  } else {
    return { statusCode: 404 };
  }
};

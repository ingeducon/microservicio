import { connect } from "mongoose";
import { config } from "./config";

export const connectDatabase = async () => {
  return connect(config.MONGO_DB_URI)
    .then(() => {
      console.log("Mongo database connected");
    })
    .catch(() => {
      console.error("Mongo database failed to connect");
    });
};

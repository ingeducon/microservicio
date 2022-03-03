import { model, Schema } from "mongoose";

export interface Dogo {
  name: string;
  imageURL: string;
  age?: number;
}

const schema = new Schema<Dogo>({
  name: { type: String, required: true },
  imageURL: { type: String, required: true },
  age: { type: Number },
});

export const DogoModel = model<Dogo>("MisPerros", schema);

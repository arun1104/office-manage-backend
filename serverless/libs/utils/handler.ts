import { MONGO_COLLECTION_NAMES } from "@constants";
import mongoose from "mongoose";

export type Handler = (event: any) => Promise<any>;

export type ModelFlags = Partial<
  Record<keyof typeof MONGO_COLLECTION_NAMES, boolean>
>;

export const withModelWrapper = (handler: Handler, models: ModelFlags) => {
  const neededModels = Object.keys(models);
  if (neededModels.length === 0) {
    return handler;
  }
  for (const neededModel of neededModels) {
    try {
      const schema = new mongoose.Schema(
        {},
        { strict: false, timestamps: true }
      );
      mongoose.model(MONGO_COLLECTION_NAMES[neededModel], schema);
    } catch (error) {
      console.log(error);
    }
  }
  return handler;
};

export const registerModels = ({models}:{models: Array<keyof typeof MONGO_COLLECTION_NAMES>}) => {
    try {
        for (const model of models) {
            mongoose.model(MONGO_COLLECTION_NAMES[model], new mongoose.Schema({}, { timestamps: true, strict: false }) as any);
        }
    } catch (error) {
        console.log(error);
    }
}


import { Model } from 'mongoose';

type QueryParams = Record<string, any>;


async function updateMany<T>(
    model: Model<T>,
    filter: object, // Filter to select multiple documents
    payload: Partial<T>
  ): Promise<T[]> {  // Return updated documents
    await model.updateMany(filter, payload);
    return model.find(filter); // Fetch and return updated documents
  }
  

export default {
    updateMany
  }
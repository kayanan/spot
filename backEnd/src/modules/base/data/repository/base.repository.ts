import { Model } from 'mongoose';

type QueryParams = Record<string, any>;

async function create<T>(
  model: Model<T>,
  payload: Partial<T>
): Promise<string> {
  const newDocument = new model(payload);
  const { _id } = await newDocument.save();
  return _id as string;
}

async function findById<T>(
  model: Model<T>,
  id: string,
  includeFields: string[] = []
): Promise<T | null> {
  const projection = includeFields.length
    ? includeFields.join(' ') // Include specific fields
    : '';
  return model.findById(id).select(projection);
}

async function findAll<T>(
  model: Model<T>,
  query: QueryParams = {},
  skip = 0,
  limit = 10,
  sort: Record<string, 1 | -1> = { createdAt: -1 },
  includeFields: string[] = [],
  populateFields: { path: string; select?: string }[] = [] // Updated type for population
): Promise<{ totalCount: number; items: T[] }> {
  const projection = includeFields.length
    ? includeFields.join(' ')
    : '';

  let queryBuilder = model
    .find(query)
    .sort(sort)
    .select(projection)
    .skip(skip)
    .limit(limit);

  // Apply population with field selection
  if (populateFields.length) {
    populateFields.forEach(({ path, select }) => {
      queryBuilder = queryBuilder.populate({ path, select });
    });
  }

  const items = await queryBuilder.exec();
  const totalCount = await model.countDocuments(query);

  return { totalCount, items };
}

async function updateById<T>(
  model: Model<T>,
  id: string,
  payload: Partial<T>
): Promise<T | null> {
  return model.findByIdAndUpdate(id, payload, { new: true });
}

async function softDeleteById<T>(
  model: Model<T>,
  id: string
): Promise<T | null> {
  // Find the document by ID
  const document = await model.findById(id).exec(); // Ensure we get a resolved Promise

  if (!document) return null;

  (document as any).isDeleted = true;

  await document.save();

  return document as T;
}

export default {
  create,
  findAll,
  findById,
  updateById,
  softDeleteById,
};

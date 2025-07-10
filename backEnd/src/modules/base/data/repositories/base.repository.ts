import { Model, Document } from "mongoose";

export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findOne({ _id: id, isDeleted: false });
  }

  async findAll(): Promise<T[]> {
    return await this.model.find({ isDeleted: false });
  }
} 
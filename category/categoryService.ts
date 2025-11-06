import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Category } from "../database/entity/category.entity";

export interface CreateCategoryInput {
  name: string;
  image?: string;
  description?: string;
  taxApplicability?: boolean;
  tax?: number;
  taxType?: string;
}

export class CategoryService {
  private readonly repository: Repository<Category>;

  constructor() {
    this.repository = AppDataSource.getRepository(Category);
  }

  async getCategories(): Promise<Category[]> {
    return this.repository.find();
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const name = input.name?.trim();
    if (!name) {
      throw new Error("Name is required");
    }

    const taxApplicability = input.taxApplicability ?? false;
    let tax: number | undefined;
    if (taxApplicability && input.tax !== undefined) {
      const parsedTax = Number(input.tax);
      if (!Number.isFinite(parsedTax) || parsedTax < 0) {
        throw new Error("Tax must be a non-negative number");
      }
      tax = parsedTax;
    }

    if (taxApplicability && (tax === undefined || tax === null)) {
      throw new Error("Tax is required when taxApplicability is true");
    }

    return this.repository.save({
      name: name,
      image: input.image?.trim() || undefined,
      description: input.description?.trim() || undefined,
      taxApplicability,
      tax,
      taxType: input.taxType?.trim() || undefined,
    });
  }

  async searchCategories(value:string): Promise<Category> {
  const result = await this.repository.findOne({where:[{id:Number(value)},{name:value}]})
  return result
  }
}

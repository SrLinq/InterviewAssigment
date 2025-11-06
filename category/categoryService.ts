import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Category } from "../database/entity/category.entity";

export interface CreateCategoryInput {
  name?: string;
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

  async updateCategory(
    id: number,
    input: CreateCategoryInput
  ): Promise<Category> {
    const category = await this.repository.findOne({ where: { id } });
    if (!category) {
      throw new Error("Category not found");
    }

    if (input.name !== undefined) {
      const trimmedName = input.name.trim();
      if (!trimmedName) {
        throw new Error("Name cannot be empty");
      }
      category.name = trimmedName;
    }

    if (input.image !== undefined) {
      const trimmedImage = input.image.trim();
      category.image = trimmedImage || category.image;
    }

    if (input.description !== undefined) {
      const trimmedDescription = input.description.trim();
      category.description = trimmedDescription || category.description;
    }

    const nextTaxApplicability =
      input.taxApplicability !== undefined
        ? input.taxApplicability
        : category.taxApplicability;

    let nextTax = category.tax;

    if (input.tax !== undefined) {
      const parsedTax = Number(input.tax);
      if (!Number.isFinite(parsedTax) || parsedTax < 0) {
        throw new Error("Tax must be a non-negative number");
      }
      nextTax = parsedTax;
    }

    if (!nextTaxApplicability) {
      nextTax = undefined;
    } else if (nextTax === undefined || nextTax === null) {
      throw new Error("Tax is required when taxApplicability is true");
    }

    category.taxApplicability = nextTaxApplicability;
    category.tax = nextTax;

    if (input.taxType !== undefined) {
      const trimmedTaxType = input.taxType.trim();
      category.taxType = trimmedTaxType || category.taxType;
    }

    return this.repository.save(category);
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

  async searchById(id: number): Promise<Category | null> {
    return this.repository.findOne({ where: { id } });
  }

  async searchByName(name: string): Promise<Category | null> {
    return this.repository.findOne({ where: { name } });
  }
}

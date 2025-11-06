import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { SubCategory } from "../database/entity/subCategory.entity";
import { Category } from "../database/entity/category.entity";

export interface CreateSubCategoryInput {
  name: string;
  categoryId: number;
  image?: string;
  description?: string;
  taxApplicability?: boolean;
  tax?: number;
}

export class SubCategoryService {
  private readonly repository: Repository<SubCategory>;
  private readonly categoryRepository: Repository<Category>;

  constructor() {
    this.repository = AppDataSource.getRepository(SubCategory);
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  async createSubCategory(
    input: CreateSubCategoryInput
  ): Promise<SubCategory> {
    const name = input.name?.trim();
    if (!name) {
      throw new Error("Name is required");
    }

    if (!input.categoryId) {
      throw new Error("categoryId is required");
    }

    const category = await this.categoryRepository.findOne({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const taxApplicability =
      input.taxApplicability !== undefined
        ? input.taxApplicability
        : category.taxApplicability;

    let tax: number | undefined;
    if (input.tax !== undefined) {
      const parsedTax = Number(input.tax);
      if (!Number.isFinite(parsedTax) || parsedTax < 0) {
        throw new Error("Tax must be a non-negative number");
      }
      tax = parsedTax;
    } else if (category.tax !== undefined && category.tax !== null) {
      tax = category.tax;
    }

    if (taxApplicability && (tax === undefined || tax === null)) {
      throw new Error("Tax is required when taxApplicability is true");
    }

    return this.repository.save({
      name,
      image: input.image?.trim() || undefined,
      description: input.description?.trim() || undefined,
      taxApplicability,
      tax,
      category,
    });
  }
}

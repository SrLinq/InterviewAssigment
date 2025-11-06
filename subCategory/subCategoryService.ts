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

export interface UpdateSubCategoryInput {
  name?: string;
  categoryId?: number;
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

  // Persist a sub-category and inherit defaults from its parent category.
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

  // Return every sub-category regardless of parent category.
  async getSubCategories(): Promise<SubCategory[]> {
    return this.repository.find();
  }

  // Look up sub-categories by different criteria to support router searches.
  async searchById(id: number): Promise<SubCategory | null> {
    return this.repository.findOne({ where: { id } });
  }

  async searchByName(name: string): Promise<SubCategory | null> {
    return this.repository.findOne({ where: { name } });
  }

  async searchByCategory(id: number): Promise<SubCategory[] | null> {
    const category = await this.categoryRepository.findOneBy({ id: id });
    if (!category) {
      return null;
    }

    return this.repository.findBy({ category: { id: category.id } });
  }

  // Update a sub-category while preserving the inherited tax logic.
  async updateSubCategory(
    id: number,
    input: UpdateSubCategoryInput
  ): Promise<SubCategory> {
    const subCategory = await this.repository.findOne({
      where: { id },
      relations: ["category"],
    });

    if (!subCategory) {
      throw new Error("Sub-category not found");
    }

    let category = subCategory.category;

    if (input.categoryId !== undefined) {
      const nextCategory = await this.categoryRepository.findOne({
        where: { id: input.categoryId },
      });

      if (!nextCategory) {
        throw new Error("Category not found");
      }

      category = nextCategory;
      subCategory.category = nextCategory;
    }

    if (input.name !== undefined) {
      const trimmedName = input.name.trim();
      if (!trimmedName) {
        throw new Error("Name cannot be empty");
      }
      subCategory.name = trimmedName;
    }

    if (input.image !== undefined) {
      const trimmedImage = input.image.trim();
      subCategory.image = trimmedImage || undefined;
    }

    if (input.description !== undefined) {
      const trimmedDescription = input.description.trim();
      subCategory.description = trimmedDescription || undefined;
    }

    const nextTaxApplicability =
      input.taxApplicability !== undefined
        ? input.taxApplicability
        : subCategory.taxApplicability ?? category.taxApplicability;

    let nextTax =
      input.tax !== undefined
        ? Number(input.tax)
        : subCategory.tax !== undefined && subCategory.tax !== null
        ? subCategory.tax
        : category.tax;

    if (input.tax !== undefined) {
      if (!Number.isFinite(nextTax) || nextTax < 0) {
        throw new Error("Tax must be a non-negative number");
      }
    } else if (nextTax !== undefined && nextTax !== null) {
      const parsedTax = Number(nextTax);
      if (!Number.isFinite(parsedTax) || parsedTax < 0) {
        throw new Error("Tax must be a non-negative number");
      }
      nextTax = parsedTax;
    }

    if (!nextTaxApplicability) {
      nextTax = undefined;
    } else if (nextTax === undefined || nextTax === null) {
      nextTax = category.tax;
      if (nextTax === undefined || nextTax === null) {
        throw new Error("Tax is required when taxApplicability is true");
      }
    }

    subCategory.taxApplicability = nextTaxApplicability;
    subCategory.tax = nextTax;

    return this.repository.save(subCategory);
  }
}

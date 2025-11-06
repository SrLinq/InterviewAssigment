import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Product } from "../database/entity/porductEntity.entity";
import { Category } from "../database/entity/category.entity";
import { SubCategory } from "../database/entity/subCategory.entity";

export interface CreateProductInput {
  name: string;
  baseAmount: number;
  discount?: number;
  image?: string;
  description?: string;
  taxApplicability?: boolean;
  tax?: number;
  categoryId?: number;
  subCategoryId?: number;
}

export class ProductService {
  private readonly repository: Repository<Product>;
  private readonly categoryRepository: Repository<Category>;
  private readonly subCategoryRepository: Repository<SubCategory>;

  constructor() {
    this.repository = AppDataSource.getRepository(Product);
    this.categoryRepository = AppDataSource.getRepository(Category);
    this.subCategoryRepository = AppDataSource.getRepository(SubCategory);
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    const name = input.name?.trim();
    if (!name) {
      throw new Error("Name is required");
    }

    if (input.baseAmount === undefined || input.baseAmount === null) {
      throw new Error("Base amount is required");
    }

    const baseAmount = Number(input.baseAmount);
    if (!Number.isFinite(baseAmount) || baseAmount < 0) {
      throw new Error("Base amount must be a non-negative number");
    }

    const discount = input.discount !== undefined ? Number(input.discount) : 0;
    if (!Number.isFinite(discount) || discount < 0) {
      throw new Error("Discount must be a non-negative number");
    }

    if (discount > baseAmount) {
      throw new Error("Discount cannot be greater than base amount");
    }

    const taxApplicability = input.taxApplicability ?? false;
    const tax =
      taxApplicability && input.tax !== undefined
        ? Number(input.tax)
        : undefined;

    if (tax !== undefined && (!Number.isFinite(tax) || tax < 0)) {
      throw new Error("Tax must be a non-negative number");
    }

    if (taxApplicability && (tax === undefined || tax === null)) {
      throw new Error("Tax is required when taxApplicability is true");
    }

    if (!input.categoryId && !input.subCategoryId) {
      throw new Error("Either categoryId or subCategoryId is required");
    }

    let category: Category | null = null;
    let subCategory: SubCategory | null = null;

    if (input.subCategoryId) {
      subCategory = await this.subCategoryRepository.findOne({
        where: { id: input.subCategoryId },
        relations: ["category"],
      });

      if (!subCategory) {
        throw new Error("Sub-category not found");
      }

      category = subCategory.category;
    }

    if (input.categoryId) {
      const requestedCategory = await this.categoryRepository.findOne({
        where: { id: input.categoryId },
      });

      if (!requestedCategory) {
        throw new Error("Category not found");
      }

      if (category && requestedCategory.id !== category.id) {
        throw new Error(
          "Sub-category does not belong to the provided category"
        );
      }

      category = requestedCategory;
    }

    if (!category) {
      throw new Error("Category not found for product");
    }

    const totalAmount = baseAmount - discount;

    return this.repository.save({
      name,
      image: input.image?.trim() || undefined,
      description: input.description?.trim() || undefined,
      taxApplicability,
      tax,
      baseAmount,
      discount,
      totalAmount,
      category,
      subCategory: subCategory || undefined,
    });
  }
}

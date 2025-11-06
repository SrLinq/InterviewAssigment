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

export interface UpdateProductInput {
  name?: string;
  baseAmount?: number;
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

  // Find all products belonging to a specific sub-category id.
  async searchBySubCategory(id: number): Promise<Product[] | null> {
    const subCategory = await this.subCategoryRepository.findOne({
      where: { id },
    });

    if (!subCategory) {
      return null;
    }

    return this.repository.findBy({ subCategory: { id: subCategory.id } });
  }

  // Retrieve every product in the catalog.
  async getProducts(): Promise<Product[]> {
    return this.repository.find();
  }

  // Locate products by top-level category.
  async searchByCategory(id: number): Promise<Product[] | null> {
    const category = await this.categoryRepository.findOneBy({ id: id });
    if (!category) {
      return null;
    }

    return this.repository.findBy({ category: { id: category.id } });
  }

  // Generic lookup helpers for search endpoints.
  async searchById(id: number): Promise<Product | null> {
    return this.repository.findOne({ where: { id } });
  }

  async searchByName(name: string): Promise<Product | null> {
    return this.repository.findOne({ where: { name } });
  }

  // Create a product while enforcing business rules around tax and pricing.
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

  // Update a product and reconcile relationships, tax, and pricing.
  async updateProduct(id: number, input: UpdateProductInput): Promise<Product> {
    const product = await this.repository.findOne({
      where: { id },
      relations: ["category", "subCategory"],
    });

    if (!product) {
      throw new Error("Product not found");
    }

    let category = product.category;
    let subCategory = product.subCategory;

    if (input.subCategoryId !== undefined) {
      if (input.subCategoryId === null) {
        subCategory = null;
      } else {
        const nextSubCategory = await this.subCategoryRepository.findOne({
          where: { id: input.subCategoryId },
          relations: ["category"],
        });

        if (!nextSubCategory) {
          throw new Error("Sub-category not found");
        }

        subCategory = nextSubCategory;
        category = nextSubCategory.category;
      }
    }

    if (input.categoryId !== undefined) {
      if (!category || category.id !== input.categoryId) {
        const nextCategory = await this.categoryRepository.findOne({
          where: { id: input.categoryId },
        });

        if (!nextCategory) {
          throw new Error("Category not found");
        }

        if (subCategory && subCategory.categoryId !== nextCategory.id) {
          throw new Error(
            "Sub-category does not belong to the provided category"
          );
        }

        category = nextCategory;
      }
    }

    if (!category) {
      throw new Error("Category is required for the product");
    }

    if (input.name !== undefined) {
      const trimmedName = input.name.trim();
      if (!trimmedName) {
        throw new Error("Name cannot be empty");
      }
      product.name = trimmedName;
    }

    if (input.image !== undefined) {
      const trimmedImage = input.image.trim();
      product.image = trimmedImage || undefined;
    }

    if (input.description !== undefined) {
      const trimmedDescription = input.description.trim();
      product.description = trimmedDescription || undefined;
    }

    if (input.baseAmount !== undefined) {
      const baseAmount = Number(input.baseAmount);
      if (!Number.isFinite(baseAmount) || baseAmount < 0) {
        throw new Error("Base amount must be a non-negative number");
      }
      product.baseAmount = baseAmount;
    }

    if (input.discount !== undefined) {
      const discount = Number(input.discount);
      if (!Number.isFinite(discount) || discount < 0) {
        throw new Error("Discount must be a non-negative number");
      }
      product.discount = discount;
    }

    if (
      product.discount !== undefined &&
      product.baseAmount !== undefined &&
      product.discount > product.baseAmount
    ) {
      throw new Error("Discount cannot be greater than base amount");
    }

    const nextTaxApplicability =
      input.taxApplicability !== undefined
        ? input.taxApplicability
        : product.taxApplicability;

    let nextTax =
      input.tax !== undefined
        ? Number(input.tax)
        : product.tax !== undefined && product.tax !== null
        ? product.tax
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

    product.taxApplicability = nextTaxApplicability;
    product.tax = nextTax;
    product.category = category;
    product.subCategory = subCategory || undefined;
    product.totalAmount = product.baseAmount - product.discount;

    return this.repository.save(product);
  }
}

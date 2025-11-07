import express from "express";
import { ProductService } from "./productService";
import { Product } from "../database/entity/porductEntity.entity";
import { sendErrorResponse } from "../utils/sendErrorResponse";

export interface ProductResponse {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  taxApplicability: boolean;
  tax: number | null;
  baseAmount: number;
  discount: number;
  totalAmount: number;
  categoryId: number | null;
  subCategoryId: number | null;
}

const productService = new ProductService();
export const productRouter = express.Router();

// Convert a Product entity into the public response shape expected by clients.
const toResponse = (product: Product): ProductResponse => ({
  id: product.id,
  name: product.name,
  image: product.image ?? null,
  description: product.description ?? null,
  taxApplicability: product.taxApplicability,
  tax: product.tax ?? null,
  baseAmount: product.baseAmount,
  discount: product.discount,
  totalAmount: product.totalAmount,
  categoryId: product.categoryId ?? product.category?.id ?? null,
  subCategoryId: product.subCategoryId ?? product.subCategory?.id ?? null,
});

// Return all products that belong to a given category id.
productRouter.get("/search/category", async (req, res) => {
  try {
    const rawIdParam = Array.isArray(req.query.id)
      ? req.query.id[0]
      : req.query.id;
    if (!rawIdParam) {
      res.status(400).json({ error: "Provide category id" });
      return;
    }

    const id = Number(rawIdParam);
    if (Number.isNaN(id)) {
      throw new Error("id must be a number");
    }

    const result = await productService.searchByCategory(id);
    if (!result) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(result.map(toResponse));
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// Return all products assigned to a specific sub-category.
productRouter.get("/search/subCategory", async (req, res) => {
  try {
    const rawIdParam = Array.isArray(req.query.id)
      ? req.query.id[0]
      : req.query.id;
    if (!rawIdParam) {
      res.status(400).json({ error: "Provide subCategory id" });
      return;
    }

    const id = Number(rawIdParam);
    if (Number.isNaN(id)) {
      throw new Error("id must be a number");
    }

    const result = await productService.searchBySubCategory(id);
    if (!result) {
      res.status(404).json({ error: "Sub-category not found" });
      return;
    }

    res.json(result.map(toResponse));
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

productRouter.get("/search", async (req, res) => {
  try {
    const { id: rawId, name: rawName } = req.query;

    if (!rawId && !rawName) {
      res.status(400).json({ error: "Provide id or name to search" });
      return;
    }

    let product: Product | null = null;

    if (rawId) {
      const id = Number(rawId);
      if (Number.isNaN(id)) {
        throw new Error("id must be a number");
      }
      product = await productService.searchById(id);
    }

    if (!product && rawName) {
      product = await productService.searchByName(String(rawName));
    }

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(toResponse(product));
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// Modify an existing product and return the updated representation.
productRouter.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw new Error("Invalid product id");
    }

    const product = await productService.updateProduct(id, req.body);
    res.json(toResponse(product));
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// Fetch the complete catalog of products.
productRouter.get("/", async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.json(products.map(toResponse));
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// Create a new product entry.
productRouter.post("/", async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(toResponse(product));
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

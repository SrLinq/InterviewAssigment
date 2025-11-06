import express from "express";
import { ProductService } from "./productService";

const productService = new ProductService();
export const productRouter = express.Router();

productRouter.post("/", async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    const categoryId =
      product.categoryId ?? product.category?.id ?? null;
    const subCategoryId =
      product.subCategoryId ?? product.subCategory?.id ?? null;
    res.status(201).json({
      id: product.id,
      name: product.name,
      image: product.image ?? null,
      description: product.description ?? null,
      taxApplicability: product.taxApplicability,
      tax: product.tax ?? null,
      baseAmount: product.baseAmount,
      discount: product.discount,
      totalAmount: product.totalAmount,
      categoryId,
      subCategoryId,
    });
  } catch (error) {
    next(error);
  }
});

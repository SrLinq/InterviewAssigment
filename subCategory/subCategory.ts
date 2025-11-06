import express from "express";
import { SubCategoryService } from "./subCategoryService";

const subCategoryService = new SubCategoryService();
export const subCategoryRouter = express.Router();

subCategoryRouter.post("/", async (req, res, next) => {
  try {
    const subCategory = await subCategoryService.createSubCategory(req.body);
    const categoryId =
      subCategory.categoryId ?? subCategory.category?.id ?? null;
    res.status(201).json({
      id: subCategory.id,
      name: subCategory.name,
      image: subCategory.image ?? null,
      description: subCategory.description ?? null,
      taxApplicability: subCategory.taxApplicability,
      tax: subCategory.tax ?? null,
      categoryId,
    });
  } catch (error) {
    next(error);
  }
});

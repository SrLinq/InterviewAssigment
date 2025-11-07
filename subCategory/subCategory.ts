import express from "express";
import { SubCategoryService } from "./subCategoryService";
import type { UpdateSubCategoryInput } from "./subCategoryService";
import { SubCategory } from "../database/entity/subCategory.entity";
import { sendErrorResponse } from "../utils/sendErrorResponse";

export interface SubCategoryResponse {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  taxApplicability: boolean;
  tax: number | null;
  categoryId: number | null;
}

const subCategoryService = new SubCategoryService();
export const subCategoryRouter = express.Router();

// Standardise API payloads so callers never see TypeORM internals.
const toResponse = (subCategory: SubCategory): SubCategoryResponse => ({
  id: subCategory.id,
  name: subCategory.name,
  image: subCategory.image ?? null,
  description: subCategory.description ?? null,
  taxApplicability: subCategory.taxApplicability,
  tax: subCategory.tax ?? null,
  categoryId: subCategory.categoryId ?? subCategory.category?.id ?? null,
});

// List every sub-category regardless of parent.
subCategoryRouter.get("/", async (_req, res) => {
  try {
    const subCategories = await subCategoryService.getSubCategories();
    res.json(subCategories.map(toResponse));
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// Retrieve all sub-categories that belong to a category id.
subCategoryRouter.get(
  "/category/:categoryId",
  async (req, res) => {
    try {
      const categoryId = Number(req.params.categoryId);
      if (Number.isNaN(categoryId)) {
        throw new Error("categoryId must be a number");
      }

      const subCategories = await subCategoryService.searchByCategory(
        categoryId
      );

      if (!subCategories) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      res.json(subCategories.map(toResponse));
    } catch (error) {
      sendErrorResponse(res, error);
    }
  }
);

// Search sub-categories by either id or name.
subCategoryRouter.get("/search", async (req, res) => {
  try {
    const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const rawName = Array.isArray(req.query.name)
      ? req.query.name[0]
      : req.query.name;

    if (!rawId && !rawName) {
      res.status(400).json({ error: "Provide id or name to search" });
      return;
    }

    let subCategory: SubCategory | null = null;

    if (rawId) {
      const id = Number(rawId);
      if (Number.isNaN(id)) {
        throw new Error("id must be a number");
      }
      subCategory = await subCategoryService.searchById(id);
    }

    if (!subCategory && rawName) {
      subCategory = await subCategoryService.searchByName(String(rawName));
    }

    if (!subCategory) {
      res.status(404).json({ error: "Sub-category not found" });
      return;
    }

    res.json(toResponse(subCategory));
  } catch (error) {
    sendErrorResponse(res, error);
  }
});


// Update an existing sub-category.
subCategoryRouter.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw new Error("Invalid subCategory id");
    }

    const subCategory = await subCategoryService.updateSubCategory(
      id,
      req.body as UpdateSubCategoryInput
    );
    res.json(toResponse(subCategory));
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

// Create a new sub-category under a category.
subCategoryRouter.post("/", async (req, res) => {
  try {
    const subCategory = await subCategoryService.createSubCategory(req.body);
    res.status(201).json(toResponse(subCategory));
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

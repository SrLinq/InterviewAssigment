import express from "express";
import { CategoryService } from "./categoryService";
import { Category } from "../database/entity/category.entity";

const categoryService = new CategoryService();
export const categoryRouter = express.Router();

// Convert the database model into the shape exposed by the API.
const toResponse = (category: Category) => ({
  id: category.id,
  name: category.name,
  image: category.image ?? null,
  description: category.description ?? null,
  taxApplicability: category.taxApplicability,
  tax: category.tax ?? null,
  taxType: category.taxType ?? null,
});

// Allow users to locate categories by id or name.
categoryRouter.get("/search", async (req, res, next) => {
  try {
    const { id: rawId, name: rawName } = req.query;

    if (!rawId && !rawName) {
      res.status(400).json({ error: "Provide id or name to search" });
      return;
    }

    let category: Category | null = null;

    if (rawId) {
      const id = Number(rawId);
      if (Number.isNaN(id)) {
        throw new Error("id must be a number");
      }
      category = await categoryService.searchById(id);
    }

    if (!category && rawName) {
      category = await categoryService.searchByName(String(rawName));
    }

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(toResponse(category));
  } catch (error) {
    next(error);
  }
});

// Retrieve the full list of categories.
categoryRouter.get("/", async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    res.json(categories.map(toResponse));
  } catch (error) {
    next(error);
  }
});

// Update a single category by identifier.
categoryRouter.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw new Error("Invalid category id");
    }

    const category = await categoryService.updateCategory(id, req.body);
    res.json(toResponse(category));
  } catch (error) {
    next(error);
  }
});

// Create a brand-new category record.
categoryRouter.post("/", async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(toResponse(category));
  } catch (error) {
    next(error);
  }
});

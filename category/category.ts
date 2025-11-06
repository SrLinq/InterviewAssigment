import express from "express";
import { CategoryService } from "./categoryService";

const categoryService = new CategoryService();
export const categoryRouter = express.Router();
categoryRouter.get("/search", async(req ,res)=>{
    const{value}=req.query
   const result = await categoryService.searchCategories(String(value))
   res.status(201).json(result)
})

categoryRouter.get("/", async(req , res)=>{
    const categories =await categoryService.getCategories()
    res.status(201).json(categories)
})

categoryRouter.post("/", async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({
      id: category.id,
      name: category.name,
      image: category.image ?? null,
      description: category.description ?? null,
      taxApplicability: category.taxApplicability,
      tax: category.tax ?? null,
      taxType: category.taxType ?? null,
    });
  } catch (error) {
    next(error);
  }
});


import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./database/data-source";
import { categoryRouter } from "./category/category";
import { subCategoryRouter } from "./subCategory/subCategory";
import { productRouter } from "./product/product";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/category", categoryRouter);
app.use("/subcategory", subCategoryRouter);
app.use("/product", productRouter);

app.use(
  (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    res.status(400).json({ error: message });
  }
);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database connection", error);
    process.exit(1);
  });

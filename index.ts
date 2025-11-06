
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./database/data-source";
import { categoryRouter } from "./category/category";
import { subCategoryRouter } from "./subCategory/subCategory";
import { productRouter } from "./product/product";

// Load environment variables so database credentials and port are available.
dotenv.config();

const app = express();
// Accept JSON payloads for all incoming requests.
app.use(express.json());

// Mount the feature routers that handle the menu resources.
app.use("/category", categoryRouter);
app.use("/subcategory", subCategoryRouter);
app.use("/product", productRouter);

// Normalise error responses so clients always receive a JSON payload.
app.use(
  (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    res.status(400).json({ error: message });
  }
);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Ensure a database connection before accepting traffic.
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

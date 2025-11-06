import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Category } from "./entity/category.entity";
import { SubCategory } from "./entity/subCategory.entity";
import { Product } from "./entity/porductEntity.entity";

// Bootstrap environment variables so TypeORM receives connection details.
dotenv.config();

// Centralised data source that initialises connections and exposes repositories.
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [Category, SubCategory, Product],
});

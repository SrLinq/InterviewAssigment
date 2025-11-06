import { Entity, Column, ManyToOne, JoinColumn, RelationId } from "typeorm";
import { SubCategory } from "./subCategory.entity";
import { Category } from "./category.entity";
import { BaseEntity } from "./baseEntity";

@Entity({ name: "product" })
export class Product extends BaseEntity {
  // Basic identity fields a customer would see in the UI.
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: true })
  image?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  // Pricing metadata used to compute totals and taxes.
  @Column({ type: "boolean", default: false })
  taxApplicability: boolean;

  @Column({ type: "int", nullable: true })
  tax?: number;

  @Column({ type: "int" })
  baseAmount: number;

  @Column({ type: "int" })
  discount: number;

  @Column({ type: "int" })
  totalAmount: number;

  // Nullable relationship so products can belong to either a sub-category or top-level category.
  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, {
    nullable: true,
  })
  @JoinColumn({ name: "SubCategoryId" })
  subCategory: SubCategory;

  @RelationId((product: Product) => product.subCategory)
  subCategoryId: number | null;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: "CategoryId" })
  category: Category;

  @RelationId((product: Product) => product.category)
  categoryId: number | null;
}

import { Entity, Column, ManyToOne, JoinColumn, RelationId } from "typeorm";
import { SubCategory } from "./subCategory.entity";
import { Category } from "./category.entity";
import { BaseEntity } from "./baseEntity";

@Entity({ name: "product" })
export class Product extends BaseEntity {
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: true })
  image?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

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

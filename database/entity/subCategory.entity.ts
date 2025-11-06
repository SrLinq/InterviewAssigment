import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
  OneToMany,
} from "typeorm";
import { Product } from "./porductEntity.entity";
import { Category } from "./category.entity";
import { BaseEntity } from "./baseEntity";

@Entity({ name: "subCategory" })
export class SubCategory extends BaseEntity {
  // Descriptive metadata for representing the sub-category in the UI.
  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: true })
  image?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  // Tax settings default to the parent category if not provided explicitly.
  @Column({ type: "boolean", default: false })
  taxApplicability: boolean;

  @Column({ type: "int", nullable: true })
  tax?: number;

  @OneToMany(() => Product, (product) => product.subCategory)
  products: Product[];

  // Every sub-category must belong to a category.
  @ManyToOne(() => Category, (category) => category.subCategories, {
    nullable: false,
  })
  @JoinColumn({ name: "CategoryId" })
  category: Category;

  @RelationId((subCategory: SubCategory) => subCategory.category)
  categoryId: number;
}

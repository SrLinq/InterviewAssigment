import { Entity, Column, OneToMany } from "typeorm";
import { Product } from "./porductEntity.entity";
import { SubCategory } from "./subCategory.entity";
import { BaseEntity } from "./baseEntity";

@Entity({ name: "category" })
export class Category extends BaseEntity {
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

  @Column({ type: "varchar", nullable: true })
  taxType?: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories: SubCategory[];
}

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

  @OneToMany(() => Product, (product) => product.subCategory)
  products: Product[];

  @ManyToOne(() => Category, (category) => category.subCategories, {
    nullable: false,
  })
  @JoinColumn({ name: "CategoryId" })
  category: Category;

  @RelationId((subCategory: SubCategory) => subCategory.category)
  categoryId: number;
}

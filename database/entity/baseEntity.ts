import { BaseEntity as TypeOrmBaseEntity, PrimaryGeneratedColumn } from "typeorm";

// Shared primary key column so every entity inherits the same id definition.
export class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}

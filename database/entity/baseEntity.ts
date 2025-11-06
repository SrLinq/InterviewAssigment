import { BaseEntity as TypeOrmBaseEntity, PrimaryGeneratedColumn } from "typeorm";

export class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}

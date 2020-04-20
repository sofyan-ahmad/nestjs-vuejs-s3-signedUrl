import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ readOnly: true })
  id: string;

  @CreateDateColumn({ nullable: true })
  @ApiProperty({ readOnly: true })
  createdAt?: Date;

  @UpdateDateColumn({ nullable: true })
  @ApiProperty({ readOnly: true })
  updatedAt?: Date;
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
  } from 'typeorm';
  
  @Entity()
  @Index(['widgetId', 'createdAt'])
  export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    widgetId: string;
  
    @Column()
    userId: string;
  
    @Column('text')
    content: string;
  
    @CreateDateColumn()
    createdAt: Date;
  }
// user.entity.ts

// Entity (user.entity.ts) : C'est une représentation
// de votre table de base de données dans le code.
// Elle définit la structure de votre table de base de données,
//  notamment les colonnes et leurs types.

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';

@Entity({ name: 'User' })
export class User {
	save() {
		throw new Error('Method not implemented.');
	}
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  username: string;

  @Column()
  authentification: boolean;

  @Column('text', { nullable: true })
  imageUrl: string;

   // Ajout 2FA

   @Column({ nullable: true })
   twoFactorAuthSecret?: string

   @Column({ default: false })
   twoFactorEnabled: boolean;
    chatMessages: any;
    messages: any;

  @Column('int', { array: true, nullable: true })
  friends?: number[];

  @Column('int', { array: true, nullable: true })
  blocked?: number[];

  @Column({ select: false, nullable: true })
  authConfirmToken?: string;

  @Column({ default: false, nullable: true })
  isVerified?: Boolean;


  @Column({nullable: true})
  email: string;
   //Ajoutez d'autres colonnes au besoin

//   @Column({ default: false })
//   enabled2fa?	: boolean;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';
import { EmailThread } from './email-thread.entity';

export enum EmailStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RECEIVED = 'received',
  FAILED = 'failed',
}

@Entity('emails')
export class Email {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column('simple-array')
  to: string[];

  @Column('simple-array', { nullable: true })
  cc: string[];

  @Column('simple-array', { nullable: true })
  bcc: string[];

  @Column({
    type: 'enum',
    enum: EmailStatus,
    default: EmailStatus.DRAFT,
  })
  status: EmailStatus;

  @Column({ type: 'uuid', nullable: true })
  threadId: string;

  @ManyToOne(() => EmailThread, (thread) => thread.emails)
  @JoinColumn({ name: 'threadId' })
  thread: EmailThread;

  @Column({ type: 'uuid', nullable: true })
  sentById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sentById' })
  sentBy: User;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid', nullable: true })
  opportunityId: string;

  @ManyToOne(() => Opportunity)
  @JoinColumn({ name: 'opportunityId' })
  opportunity: Opportunity;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  sentAt: Date;

  @Column({ nullable: true })
  receivedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


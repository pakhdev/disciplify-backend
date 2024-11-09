import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { Category } from '../../category/entities/category.entity';
import { RestrictedDaysPolicy } from '../enums/restricted-days-policy.enum';
import { TaskType } from '../enums/task-type.enum';
import { User } from '../../authorization/entities/user.entity';

@Entity()
export class Task {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ length: 255, nullable: false })
    name: string;

    @Column({ type: 'enum', enum: TaskType, default: TaskType.TO_DO })
    type: TaskType;

    @Column({ default: false })
    isOptional: boolean;

    @Column({ default: false })
    isRecurring: boolean;

    @Column()
    difficulty: number;

    @Column({ default: 0 })
    iterationCount: number;

    @Column()
    iterationLimit: number;

    @Column()
    currentScore: number;

    @Column()
    maxScore: number;

    @Column({ nullable: false })
    initAt: Date;

    @Column({ nullable: false })
    nextActivationAt: Date;

    @Column({ default: 1 })
    repeatInterval: number;

    @Column()
    allowedDays: number;

    @Column({
        type: 'enum',
        enum: RestrictedDaysPolicy,
        default: RestrictedDaysPolicy.BEFORE,
    })
    restricted_days_policy: RestrictedDaysPolicy;

    @Column({ default: false })
    finished: boolean;

    @ManyToMany(() => Category, (category) => category.tasks, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    categories: Category[];

    @ManyToOne(() => User, (user) => user.tasks)
    @JoinColumn({ name: 'user_id' })
    user: User;
}

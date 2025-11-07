import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SplitwiseController } from './splitwise.controller';
import { SplitwiseService } from './splitwise.service';
import { SplitwiseGroup } from 'src/common/entity/widget/splitwise/splitwise-group.entity';
import { SplitwiseMember } from 'src/common/entity/widget/splitwise/splitwise-member.entity';
import { SplitwiseExpense } from 'src/common/entity/widget/splitwise/splitwise-expense.entity';
import { SplitwiseExpenseAllocation } from 'src/common/entity/widget/splitwise/splitwise-expense-allocation.entity';
import { CustomSpaceModule } from 'src/module/custom-space/custom-space.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SplitwiseGroup,
      SplitwiseMember,
      SplitwiseExpense,
      SplitwiseExpenseAllocation,
    ]),
    CustomSpaceModule
  ],
  controllers: [SplitwiseController],
  providers: [SplitwiseService],
})
export class SplitwiseModule {}



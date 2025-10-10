import { SplitType } from './create-expense.dto';

export class UpdateSplitwiseExpenseDto {
  description?: string;
  amount?: number;
  currency?: string;
  paidAt?: Date | string;
  paidByMemberId?: string;
  splitType?: SplitType;

  participantMemberIds?: string[];
  exactAllocations?: { memberId: string; amount: number }[];
  percentAllocations?: { memberId: string; percent: number }[];
}



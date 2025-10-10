export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENT';

export class CreateSplitwiseExpenseDto {
  description?: string;
  amount: number;
  currency?: string;
  paidAt?: Date | string;
  paidByMemberId: string;
  splitType: SplitType;

  // For EQUAL splits
  participantMemberIds?: string[];

  // For EXACT splits
  exactAllocations?: { memberId: string; amount: number }[];

  // For PERCENT splits
  percentAllocations?: { memberId: string; percent: number }[];
}



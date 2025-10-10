import {
    Injectable,
    BadRequestException,
    NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SplitwiseGroup } from 'src/common/entity/widget/splitwise/splitwise-group.entity';
import { SplitwiseMember } from 'src/common/entity/widget/splitwise/splitwise-member.entity';
import { SplitwiseExpense } from 'src/common/entity/widget/splitwise/splitwise-expense.entity';
import { SplitwiseExpenseAllocation } from 'src/common/entity/widget/splitwise/splitwise-expense-allocation.entity';
import { CreateSplitwiseMemberDto } from 'src/common/dto/widget/splitwise/create-member.dto';
import { CreateSplitwiseExpenseDto } from 'src/common/dto/widget/splitwise/create-expense.dto';
import { UpdateSplitwiseExpenseDto } from 'src/common/dto/widget/splitwise/update-expense.dto';

type BalanceMap = Record<string, number>; // memberId -> net balance (positive means others owe them)

@Injectable()
export class SplitwiseService {
    constructor(
        @InjectRepository(SplitwiseGroup)
        private readonly groupRepo: Repository<SplitwiseGroup>,
        @InjectRepository(SplitwiseMember)
        private readonly memberRepo: Repository<SplitwiseMember>,
        @InjectRepository(SplitwiseExpense)
        private readonly expenseRepo: Repository<SplitwiseExpense>,
        @InjectRepository(SplitwiseExpenseAllocation)
        private readonly allocationRepo: Repository<SplitwiseExpenseAllocation>
    ) {}

    // Group bootstrap
    private async getOrCreateGroup(widgetId: string): Promise<SplitwiseGroup> {
        let group = await this.groupRepo.findOne({ where: { widgetId } });
        if (!group) {
            group = this.groupRepo.create({ widgetId });
            await this.groupRepo.save(group);
        }
        return group;
    }

    // Members
    async addMember(
        widgetId: string,
        dto: CreateSplitwiseMemberDto
    ): Promise<SplitwiseMember> {
        const group = await this.getOrCreateGroup(widgetId);
        const existing = await this.memberRepo.findOne({
            where: { group: { id: group.id }, userId: dto.userId }
        });
        if (existing) return existing;
        const member = this.memberRepo.create({
            userId: dto.userId,
            displayName: dto.displayName,
            group
        });
        return this.memberRepo.save(member);
    }

    async getMembers(widgetId: string): Promise<SplitwiseMember[]> {
        const group = await this.getOrCreateGroup(widgetId);
        return this.memberRepo.find({ where: { group: { id: group.id } } });
    }

    async removeMember(memberId: string): Promise<void> {
        const member = await this.memberRepo.findOne({
            where: { id: memberId }
        });
        if (!member) throw new NotFoundException('Member not found');
        const hasAllocations = await this.allocationRepo.exist({
            where: { member: { id: memberId } }
        });
        if (hasAllocations)
            throw new BadRequestException(
                'Member has allocations; settle or reassign before removal'
            );
        await this.memberRepo.remove(member);
    }

    // Expenses
    async createExpense(
        widgetId: string,
        dto: CreateSplitwiseExpenseDto
    ): Promise<SplitwiseExpense> {
        const group = await this.getOrCreateGroup(widgetId);
        const paidBy = await this.memberRepo.findOne({
            where: { id: dto.paidByMemberId, group: { id: group.id } }
        });
        if (!paidBy)
            throw new BadRequestException('paidByMemberId not in group');

        const expense = this.expenseRepo.create({
            group,
            paidBy,
            amount: dto.amount,
            currency: dto.currency ?? 'USD',
            description: dto.description,
            paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
            splitType: dto.splitType
        });

        const allocations = await this.buildAllocations(group.id, dto);
        expense.allocations = allocations.map((a) =>
            this.allocationRepo.create(a)
        );
        await this.expenseRepo.save(expense);
        return this.expenseRepo.findOne({
            where: { id: expense.id },
            relations: ['paidBy', 'allocations', 'allocations.member']
        });
    }

    async listExpenses(widgetId: string): Promise<SplitwiseExpense[]> {
        const group = await this.getOrCreateGroup(widgetId);
        return this.expenseRepo.find({
            where: { group: { id: group.id } },
            relations: ['paidBy', 'allocations', 'allocations.member']
        });
    }

    async updateExpense(
        expenseId: string,
        dto: UpdateSplitwiseExpenseDto
    ): Promise<SplitwiseExpense> {
        const expense = await this.expenseRepo.findOne({
            where: { id: expenseId },
            relations: ['group', 'allocations', 'paidBy']
        });
        if (!expense) throw new NotFoundException('Expense not found');

        if (dto.paidByMemberId) {
            const paidBy = await this.memberRepo.findOne({
                where: {
                    id: dto.paidByMemberId,
                    group: { id: expense.group.id }
                }
            });
            if (!paidBy)
                throw new BadRequestException('paidByMemberId not in group');
            expense.paidBy = paidBy;
        }
        if (dto.amount !== undefined) expense.amount = dto.amount;
        if (dto.currency !== undefined) expense.currency = dto.currency;
        if (dto.description !== undefined)
            expense.description = dto.description;
        if (dto.paidAt !== undefined)
            expense.paidAt = dto.paidAt ? new Date(dto.paidAt) : null;
        if (dto.splitType !== undefined) expense.splitType = dto.splitType;

        if (
            dto.splitType ||
            dto.participantMemberIds ||
            dto.exactAllocations ||
            dto.percentAllocations ||
            dto.amount !== undefined
        ) {
            await this.allocationRepo.delete({
                expense: { id: expense.id } as any
            });
            const newAllocations = await this.buildAllocations(
                expense.group.id,
                {
                    splitType: dto.splitType ?? (expense.splitType as any),
                    amount: expense.amount,
                    paidByMemberId: expense.paidBy.id,
                    participantMemberIds: dto.participantMemberIds,
                    exactAllocations: dto.exactAllocations,
                    percentAllocations: dto.percentAllocations
                } as any
            );
            expense.allocations = newAllocations.map((a) =>
                this.allocationRepo.create(a)
            );
        }

        await this.expenseRepo.save(expense);
        return this.expenseRepo.findOne({
            where: { id: expense.id },
            relations: ['paidBy', 'allocations', 'allocations.member']
        });
    }

    async deleteExpense(expenseId: string): Promise<void> {
        const expense = await this.expenseRepo.findOne({
            where: { id: expenseId }
        });
        if (!expense) throw new NotFoundException('Expense not found');
        await this.expenseRepo.remove(expense);
    }

    // Balances
    async getBalances(
        widgetId: string
    ): Promise<{ memberId: string; displayName?: string; balance: number }[]> {
        const group = await this.getOrCreateGroup(widgetId);
        const members = await this.memberRepo.find({
            where: { group: { id: group.id } }
        });
        const expenses = await this.expenseRepo.find({
            where: { group: { id: group.id } },
            relations: ['paidBy', 'allocations', 'allocations.member']
        });
        const balances: BalanceMap = {};
        for (const m of members) balances[m.id] = 0;

        for (const expense of expenses) {
            balances[expense.paidBy.id] += expense.amount;
            for (const allocation of expense.allocations) {
                balances[allocation.member.id] -= allocation.amount;
            }
        }

        return members.map((m) => ({
            memberId: m.id,
            displayName: m.displayName,
            balance: round2(balances[m.id] ?? 0)
        }));
    }

    async getSettlement(
        widgetId: string
    ): Promise<{ fromMemberId: string; toMemberId: string; amount: number }[]> {
        const balances = await this.getBalances(widgetId);
        const debtors = balances
            .filter((b) => b.balance < 0)
            .map((b) => ({ id: b.memberId, amount: -b.balance }));
        const creditors = balances
            .filter((b) => b.balance > 0)
            .map((b) => ({ id: b.memberId, amount: b.balance }));

        debtors.sort((a, b) => a.amount - b.amount); // sort in ascending order
        creditors.sort((a, b) => a.amount - b.amount); // sort in ascending order

        /*
        You’re matching:

        The smallest debtor first (owes the least)

        With the smallest creditor first (is owed the least)

        This “greedy” strategy systematically clears out small debts and credits first, simplifying the matching process.

        It’s not mathematically optimal (not guaranteed to minimize the number of transfers), but it’s:
        ✅ simple
        ✅ deterministic
        ✅ always yields a correct zero-sum settlement
        */

        const transfers: {
            fromMemberId: string;
            toMemberId: string;
            amount: number;
        }[] = [];
        let i = 0,
            j = 0;
        while (i < debtors.length && j < creditors.length) {
            const pay = Math.min(debtors[i].amount, creditors[j].amount);
            if (pay > 0.005) {
                transfers.push({
                    fromMemberId: debtors[i].id,
                    toMemberId: creditors[j].id,
                    amount: round2(pay)
                });
            }
            debtors[i].amount = round2(debtors[i].amount - pay);
            creditors[j].amount = round2(creditors[j].amount - pay);
            if (debtors[i].amount <= 0.005) i++;
            if (creditors[j].amount <= 0.005) j++;
        }
        return transfers;
    }

    // Helpers
    private async buildAllocations(
        groupId: string,
        dto: CreateSplitwiseExpenseDto
    ): Promise<{ member: SplitwiseMember; amount: number }[]> {
        if (dto.splitType === 'EQUAL') {
            if (
                !dto.participantMemberIds ||
                dto.participantMemberIds.length === 0
            ) {
                const members = await this.memberRepo.find({
                    where: { group: { id: groupId } }
                });
                dto.participantMemberIds = members.map((m) => m.id);
            } else if (
                dto.participantMemberIds &&
                dto.participantMemberIds.length > 0
            ) {
                const members = await this.memberRepo.find({
                    where: {
                        id: In(dto.participantMemberIds),
                        group: { id: groupId }
                    }
                });
                dto.participantMemberIds = members.map((m) => m.id);
            }

            const count = dto.participantMemberIds.length;
            if (count === 0)
                throw new BadRequestException('No participants provided');
            const share = round2(dto.amount / count);
            const adjustments = adjustToSum(share, count, dto.amount);
            const members = await this.memberRepo.find({
                where: { id: In(dto.participantMemberIds) }
            });
            return members.map((m, idx) => ({
                member: m,
                amount: adjustments[idx]
            }));
        }

        if (dto.splitType === 'EXACT') {
            const total = round2(
                dto.exactAllocations?.reduce((s, a) => s + a.amount, 0) ?? 0
            );
            if (Math.abs(total - round2(dto.amount)) > 0.01) {
                throw new BadRequestException(
                    'Exact allocations do not sum to amount'
                );
            }
            const ids = dto.exactAllocations?.map((a) => a.memberId) ?? [];
            const members = await this.memberRepo.find({
                where: { id: In(ids), group: { id: groupId } }
            });
            const map: Record<string, SplitwiseMember> = Object.fromEntries(
                members.map((m) => [m.id, m])
            );
            return (dto.exactAllocations ?? []).map((a) => {
                const member = map[a.memberId];
                if (!member)
                    throw new BadRequestException(
                        'Member not found in group: ' + a.memberId
                    );
                return { member, amount: round2(a.amount) };
            });
        }

        if (dto.splitType === 'PERCENT') {
            const totalPercent = round2(
                (dto.percentAllocations ?? []).reduce(
                    (s, a) => s + a.percent,
                    0
                )
            );
            if (Math.abs(totalPercent - 100) > 0.01)
                throw new BadRequestException(
                    'Percent allocations must sum to 100'
                );
            const ids = dto.percentAllocations?.map((a) => a.memberId) ?? [];
            const members = await this.memberRepo.find({
                where: { id: In(ids), group: { id: groupId } }
            });
            const map: Record<string, SplitwiseMember> = Object.fromEntries(
                members.map((m) => [m.id, m])
            );
            return (dto.percentAllocations ?? []).map((a, idx) => {
                const member = map[a.memberId];
                if (!member)
                    throw new BadRequestException(
                        'Member not found in group: ' + a.memberId
                    );
                const raw = (dto.amount * a.percent) / 100;
                return {
                    member,
                    amount:
                        idx === dto.percentAllocations!.length - 1
                            ? round2(
                                  dto.amount -
                                      sumPrev(
                                          dto.percentAllocations!,
                                          dto.amount,
                                          idx
                                      )
                              )
                            : round2(raw)
                };
            });
        }

        throw new BadRequestException('Unsupported splitType');
    }
}

function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

function adjustToSum(share: number, count: number, target: number): number[] {
    // Distribute rounding differences so that the sum equals target
    const arr = Array.from({ length: count }, () => round2(share));
    let diff = round2(target - arr.reduce((s, x) => s + x, 0));
    let i = 0;
    while (Math.abs(diff) > 0.001 && i < count * 2) {
        const step = diff > 0 ? 0.01 : -0.01;
        arr[i % count] = round2(arr[i % count] + step);
        diff = round2(target - arr.reduce((s, x) => s + x, 0));
        i++;
    }
    return arr;
}

function sumPrev(
    items: { percent: number }[],
    amount: number,
    lastIdx: number
): number {
    let sum = 0;
    for (let i = 0; i < lastIdx; i++)
        sum += round2((amount * items[i].percent) / 100);
    return round2(sum);
}

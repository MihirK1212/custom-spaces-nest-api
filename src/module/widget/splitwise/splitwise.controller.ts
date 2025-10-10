import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SplitwiseService } from './splitwise.service';
import { CreateSplitwiseMemberDto } from 'src/common/dto/widget/splitwise/create-member.dto';
import { CreateSplitwiseExpenseDto } from 'src/common/dto/widget/splitwise/create-expense.dto';
import { UpdateSplitwiseExpenseDto } from 'src/common/dto/widget/splitwise/update-expense.dto';

@Controller('api/widgets/splitwise')
export class SplitwiseController {
  constructor(private readonly service: SplitwiseService) {}

  // Members
  @Post(':widgetId/members')
  addMember(@Param('widgetId') widgetId: string, @Body() dto: CreateSplitwiseMemberDto) {
    return this.service.addMember(widgetId, dto);
  }

  @Get(':widgetId/members')
  getMembers(@Param('widgetId') widgetId: string) {
    return this.service.getMembers(widgetId);
  }

  @Delete('members/:memberId')
  removeMember(@Param('memberId') memberId: string) {
    return this.service.removeMember(memberId);
  }

  // Expenses
  @Post(':widgetId/expenses')
  createExpense(@Param('widgetId') widgetId: string, @Body() dto: CreateSplitwiseExpenseDto) {
    return this.service.createExpense(widgetId, dto);
  }

  @Get(':widgetId/expenses')
  listExpenses(@Param('widgetId') widgetId: string) {
    return this.service.listExpenses(widgetId);
  }

  @Patch('expenses/:expenseId')
  updateExpense(@Param('expenseId') expenseId: string, @Body() dto: UpdateSplitwiseExpenseDto) {
    return this.service.updateExpense(expenseId, dto);
  }

  @Delete('expenses/:expenseId')
  deleteExpense(@Param('expenseId') expenseId: string) {
    return this.service.deleteExpense(expenseId);
  }

  // Balances and settlement
  @Get(':widgetId/balances')
  getBalances(@Param('widgetId') widgetId: string) {
    return this.service.getBalances(widgetId);
  }

  @Get(':widgetId/settlement')
  getSettlement(@Param('widgetId') widgetId: string) {
    return this.service.getSettlement(widgetId);
  }
}



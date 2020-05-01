import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import ComputeBalanceService from '../services/ComputeBalanceService';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find({ relations: ['category'] });
    if (transactions.length === 0) {
      return { income: 0, outcome: 0, total: 0 };
    }

    const computeBalanceService = new ComputeBalanceService();
    const balance = computeBalanceService.execute(transactions);

    return balance;
  }
}

export default TransactionsRepository;

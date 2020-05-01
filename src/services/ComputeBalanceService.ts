import Transaction from '../models/Transaction';
import BalanceReducer from '../helpers/BalanceReducer';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class ComputeBalanceService {
  public execute(transactions: Transaction[]): Balance {
    const incomeReducer = new BalanceReducer('income').getReducerFunction();
    const outcomeReducer = new BalanceReducer('outcome').getReducerFunction();
    const mockInitialValue: Transaction = {
      title: 'mockTransaction',
      type: 'income',
      value: 0,
      id: '',
      created_at: new Date(),
      updated_at: new Date(),
      category_id: '',
      category: new Category(),
    };

    const income = transactions.reduce(incomeReducer, mockInitialValue).value;
    const outcome = transactions.reduce(outcomeReducer, mockInitialValue).value;
    const total = income - outcome;

    const balance: Balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default ComputeBalanceService;

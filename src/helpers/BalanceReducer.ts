import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Reducer {
  (
    previousValue: Transaction,
    currentValue: Transaction,
    currentIndex?: number,
    array?: Transaction[],
  ): Transaction;
}

interface BalanceReducerType {
  (): Reducer;
}

class BalanceReducer {
  transactionType: 'income' | 'outcome';

  constructor(transactionType: 'income' | 'outcome') {
    this.transactionType = transactionType;
  }

  public getReducerFunction: BalanceReducerType = () => {
    const computedTransaction: Transaction = {
      title: 'computedTransaction',
      type: 'income',
      value: 0,
      id: '',
      created_at: new Date(),
      updated_at: new Date(),
      category_id: '',
      category: new Category(),
    };

    const reducer: Reducer = (
      accumulator: Transaction,
      currentTransaction: Transaction,
    ) => {
      computedTransaction.value = accumulator.value;

      if (currentTransaction.type === this.transactionType) {
        computedTransaction.value =
          currentTransaction.value + accumulator.value;
      }

      return computedTransaction;
    };

    return reducer;
  };
}

export default BalanceReducer;

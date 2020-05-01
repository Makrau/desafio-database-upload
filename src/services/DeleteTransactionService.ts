import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(transactionId: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const transaction = await transactionsRepository.findOne(transactionId);

    if (!transaction) {
      throw new AppError('Transaction not found');
    }

    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;

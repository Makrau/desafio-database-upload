import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';
import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}

class CreateTransactionService {
  transactionsRepository: TransactionRepository;

  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: RequestDTO): Promise<Transaction> {
    if (!value || value < 0) {
      throw new AppError('Must provide a value greater then 0');
    }

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid Type');
    }

    this.transactionsRepository = getCustomRepository(TransactionRepository);

    if (type === 'outcome') {
      await this.checkForSufficientBalance(value);
    }

    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const category = await categoriesRepository.findOrCreate(categoryTitle);

    const transaction = await this.transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await this.transactionsRepository.save(transaction);

    return transaction;
  }

  async checkForSufficientBalance(outcomeValue: number): Promise<void> {
    const balance = await this.transactionsRepository.getBalance();

    if (balance.total < outcomeValue) {
      throw new AppError('Insufficient funds');
    }
  }
}

export default CreateTransactionService;

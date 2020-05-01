import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}

class CreateTransactionService {
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

    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const category = await categoriesRepository.findOrCreate(categoryTitle);

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

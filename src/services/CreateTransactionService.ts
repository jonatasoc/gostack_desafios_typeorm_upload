import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    // Impedindo que o Balance seja negativo

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Balance is not enough for this transaction.');
    }

    // Tratando Categorias, se já existem ou não no Banco
    const categoriesRepository = getRepository(Category);

    let categoryName = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryName) {
      categoryName = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryName);
    }

    const categoryId = categoryName.id;

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryId,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

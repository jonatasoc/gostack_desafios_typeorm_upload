import path from 'path';
import fs from 'fs';

import csv from 'csv-parser';

import { getRepository, getCustomRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', 'import.csv');

interface CSVTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  private async loadCSV(_filePath: string): Promise<any[]> {
    const transactions: string[] = [];
    const readCSVStream = fs.createReadStream(csvFilePath).pipe(
      csv({
        headers: ['title', 'type', 'value', 'category'],
        skipLines: 1,
      }),
    );

    readCSVStream.on('data', async data => transactions.push(data));

    await new Promise(resolve => {
      readCSVStream.on('end', resolve);
      if (csvFilePath) {
        fs.promises.unlink(csvFilePath);
      }
    });

    return transactions;
  }

  public async execute(): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoriesRepository = getRepository(Category);

    const transactions: CSVTransaction[] = await this.loadCSV(csvFilePath);

    const categories: string[] = [];

    transactions.map(transaction => {
      return categories.push(transaction.category);
    });

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      category => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = await categoriesRepository.find();

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;

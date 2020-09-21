import path from 'path';
import fs from 'fs';

import csv from 'csv-parser';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', 'import.csv');

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  private async loadCSV(_filePath: string): any[] {
    const results = [];

    fs.createReadStream(csvFilePath)
      .pipe(
        csv({
          headers: ['title', 'type', 'value', 'category'],
          skipLines: 1,
      }))
      .on('data', data => results.push(data))
      .on('end', () => {
        console.log(results);
      });

    if (csvFilePath) {
      await fs.promises.unlink(csvFilePath);
    }

    return results;
  }

  public async execute(): Promise<Transaction[]> {
    const transactions = await this.loadCSV(csvFilePath);
    // console.log(transactions);
    const createTransactionService = new CreateTransactionService();

    transactions.map(async transaction => {
      await createTransactionService.execute(transaction);
      console.log(transaction);
    });
  }
}

export default ImportTransactionsService;

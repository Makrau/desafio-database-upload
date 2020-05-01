import path from 'path';
import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import getCSVParser from '../helpers/getCSVParser';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(transactionsFilename: string): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, transactionsFilename);

    const csvParser = getCSVParser(filePath);
    const csvLinesData = await this.readCSV(csvParser);
    await fs.promises.unlink(filePath);
    const transactions = await this.buildTransactionsFromCSV(csvLinesData);

    return transactions;
  }

  async readCSV(csvParser: csvParse.Parser): Promise<Array<string[]>> {
    const lines = new Array<string[]>();
    csvParser.on('data', (line: string[]) => {
      lines.push(line);
    });

    await new Promise(resolve => {
      csvParser.on('end', resolve);
    });

    return lines;
  }

  async buildTransactionsFromCSV(
    csvLines: Array<string[]>,
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const createTransactionService = new CreateTransactionService();

    const promises = csvLines.map(async (line, index) => {
      const [title, type, valueString, category] = line;

      if (type !== 'income' && type !== 'outcome') {
        console.warn(`error on line ${index + 1} while importing transactions`);
        console.warn('invalid transaction type');
        return;
      }
      const validType = type === 'income' ? 'income' : 'outcome';

      const value = parseInt(valueString, 10);
      const transaction = await createTransactionService.execute({
        title,
        type: validType,
        value,
        categoryTitle: category,
      });

      transactions.push(transaction);
    });

    await Promise.all(promises);

    return transactions;
  }
}

export default ImportTransactionsService;

/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
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

    /**
     * Ocorre um problema nesse trecho onde as transações sao criadas em paralelo,
     * e quando há um outcome sem processar um income anterior, dá erro devido a falta de saldo;
     * A solução seria forçar as promises a resolver de maneira sincrona;
     */
    // const promises = await csvLines.map(async line => {
    //   const [title, type, valueString, category] = line;

    //   const validType = type === 'income' ? 'income' : 'outcome';

    //   const value = parseInt(valueString, 10);
    //   const transaction = await createTransactionService.execute({
    //     title,
    //     type: validType,
    //     value,
    //     categoryTitle: category,
    //   });

    //   transactions.push(transaction);
    // });

    // await Promise.all(promises);

    /**
     * Alternativa encontrada para forçar a criação das transações de
     * maneira sequencial;
     */

    for (const line of csvLines) {
      const [title, type, valueString, category] = line;

      const validType = type === 'income' ? 'income' : 'outcome';

      const value = parseInt(valueString, 10);
      const transaction = await createTransactionService.execute({
        title,
        type: validType,
        value,
        categoryTitle: category,
      });

      transactions.push(transaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;

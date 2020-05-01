import fs from 'fs';
import csvParse from 'csv-parse';

export default (csvFilePath: string): csvParse.Parser => {
  const fileStream = fs.createReadStream(csvFilePath);
  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = fileStream.pipe(parseStream);

  return parseCSV;
};

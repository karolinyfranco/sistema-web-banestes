import Papa from "papaparse";

// Função que converte o texto CSV em uma lista de objetos tipados (T)
export function parseCSV<T>(csvText: string, mapFn: (row: string[]) => T): T[] {
  const parsed = Papa.parse<string[]>(csvText, { header: false });
  const rows = parsed.data;

  const result: T[] = [];

  for (let i = 1; i < rows.length; i++) {
    result.push(mapFn(rows[i]));
  }

  return result;
}

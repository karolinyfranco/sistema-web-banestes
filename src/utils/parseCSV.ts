export function parseCSV<T>(csvText: string, mapFn: (row: string[]) => T): T[] {
    const lines = csvText.trim().split("\n");
    const result: T[] = [];
  
    for (let i = 1; i < lines.length; i++) { // pula o cabeçalho
      const row = lines[i].split(",");
      result.push(mapFn(row));
    }
  
    return result;
  }
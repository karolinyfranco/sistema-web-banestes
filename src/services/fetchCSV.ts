export async function fetchCSV(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erro ao buscar CSV");
    }
    const text = await response.text();
    return text;
  }
  
import * as XLSX from "xlsx";

export function buildWorkbookBuffer(rows: Record<string, unknown>[], sheetName: string) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

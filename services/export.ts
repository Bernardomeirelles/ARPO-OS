import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

type ExportRow = Record<string, string | number | boolean | null>;

export function exportToCsv(filename: string, rows: ExportRow[]) {
  if (rows.length === 0) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToXlsx(filename: string, rows: ExportRow[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPdf(title: string, rows: ExportRow[]) {
  const pdf = new jsPDF();
  pdf.setFontSize(16);
  pdf.text(title, 14, 18);
  pdf.setFontSize(10);

  let y = 30;
  rows.slice(0, 18).forEach((row) => {
    pdf.text(Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(" | "), 14, y);
    y += 8;
  });

  pdf.save(`${title.toLowerCase().replace(/\s/g, "-")}.pdf`);
}

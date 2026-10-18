import { Transaction, Category, UserSettings } from '../types';
import { formatCurrency, fromMinorUnits, formatDate } from './currencyFormatter';

export function exportTransactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
  settings: UserSettings
): void {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = ['Date', 'Type', 'Category', 'Amount (' + settings.currency + ')', 'Payment Method', 'Note', 'Transaction ID'];
  
  const rows = transactions.map((t) => {
    const categoryName = categoryMap.get(t.categoryId) || 'Uncategorized';
    const amountVal = (t.type === 'expense' ? '-' : '+') + fromMinorUnits(t.amount).toFixed(2);
    const dateFormatted = formatDate(t.date, settings.dateFormat);
    const noteEscaped = `"${(t.note || '').replace(/"/g, '""')}"`;
    const payment = t.paymentMethod.replace('_', ' ').toUpperCase();

    return [
      dateFormatted,
      t.type.toUpperCase(),
      `"${categoryName}"`,
      amountVal,
      payment,
      noteEscaped,
      t.id,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `PaisaTrack_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSONBackup(jsonData: string): void {
  const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `PaisaTrack_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean print view for generating PDF statements
 */
export function printMonthlyStatement(
  monthName: string,
  transactions: Transaction[],
  categories: Category[],
  settings: UserSettings,
  summary: { totalIncome: number; totalExpense: number; netCashFlow: number }
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const rowsHtml = transactions
    .map(
      (t) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 8px 12px;">${formatDate(t.date, settings.dateFormat)}</td>
      <td style="padding: 8px 12px; font-weight: 500;">${categoryMap.get(t.categoryId) || 'Other'}</td>
      <td style="padding: 8px 12px; color: #4b5563;">${t.note || '-'}</td>
      <td style="padding: 8px 12px; text-transform: uppercase; font-size: 11px;">${t.paymentMethod.replace('_', ' ')}</td>
      <td style="padding: 8px 12px; text-align: right; font-weight: 600; color: ${
        t.type === 'income' ? '#059669' : '#dc2626'
      };">
        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, settings.currency, settings.numberFormat)}
      </td>
    </tr>`
    )
    .join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>PaisaTrack Statement - ${monthName}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; padding: 32px; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111827; padding-bottom: 16px; margin-bottom: 24px; }
      .summary-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px; }
      .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
      .card-title { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 4px; }
      .card-value { font-size: 20px; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
      th { background: #f3f4f6; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #4b5563; }
      @media print {
        body { padding: 0; }
        button { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PAISATRACK</h1>
        <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">Official Personal Finance Statement • ${monthName}</p>
      </div>
      <div style="text-align: right;">
        <button onclick="window.print()" style="background: #111827; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">Print / Save as PDF</button>
      </div>
    </div>

    <div class="summary-cards">
      <div class="card">
        <div class="card-title">Total Income</div>
        <div class="card-value" style="color: #059669;">+${formatCurrency(summary.totalIncome, settings.currency, settings.numberFormat)}</div>
      </div>
      <div class="card">
        <div class="card-title">Total Expenses</div>
        <div class="card-value" style="color: #dc2626;">-${formatCurrency(summary.totalExpense, settings.currency, settings.numberFormat)}</div>
      </div>
      <div class="card">
        <div class="card-title">Net Cash Flow</div>
        <div class="card-value" style="color: ${summary.netCashFlow >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(summary.netCashFlow, settings.currency, settings.numberFormat)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description / Note</th>
          <th>Method</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    <p style="margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center;">Generated locally by PaisaTrack on ${new Date().toLocaleDateString()}</p>
  </body>
  </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

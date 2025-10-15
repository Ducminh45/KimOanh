import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { formatDate, formatCalories, formatMacros } from './formatters';

interface ExportData {
  foodLogs?: any[];
  waterLogs?: any[];
  exerciseLogs?: any[];
  weightLogs?: any[];
  startDate: string;
  endDate: string;
}

/**
 * Export data to CSV format
 */
export const exportToCSV = async (data: ExportData): Promise<void> => {
  try {
    let csvContent = '';

    // Food Logs
    if (data.foodLogs && data.foodLogs.length > 0) {
      csvContent += 'FOOD LOGS\n';
      csvContent += 'Date,Meal Type,Food Name,Calories,Protein,Carbs,Fats,Serving Size\n';
      
      data.foodLogs.forEach((log) => {
        csvContent += `${formatDate(log.loggedAt)},${log.mealType},${log.foodName},${log.calories},${log.protein},${log.carbohydrates},${log.fats},${log.servingSize}\n`;
      });
      csvContent += '\n';
    }

    // Water Logs
    if (data.waterLogs && data.waterLogs.length > 0) {
      csvContent += 'WATER LOGS\n';
      csvContent += 'Date,Amount (ml)\n';
      
      data.waterLogs.forEach((log) => {
        csvContent += `${formatDate(log.loggedAt)},${log.amountMl}\n`;
      });
      csvContent += '\n';
    }

    // Exercise Logs
    if (data.exerciseLogs && data.exerciseLogs.length > 0) {
      csvContent += 'EXERCISE LOGS\n';
      csvContent += 'Date,Exercise Type,Duration (min),Intensity,Calories Burned\n';
      
      data.exerciseLogs.forEach((log) => {
        csvContent += `${formatDate(log.loggedAt)},${log.exerciseType},${log.durationMinutes},${log.intensity},${log.caloriesBurned}\n`;
      });
      csvContent += '\n';
    }

    // Weight Logs
    if (data.weightLogs && data.weightLogs.length > 0) {
      csvContent += 'WEIGHT LOGS\n';
      csvContent += 'Date,Weight (kg),BMI,Notes\n';
      
      data.weightLogs.forEach((log) => {
        csvContent += `${formatDate(log.loggedAt)},${log.weight},${log.bmi || ''},${log.notes || ''}\n`;
      });
      csvContent += '\n';
    }

    // Save to file
    const filename = `nutriscanvn_export_${Date.now()}.csv`;
    const filepath = `${FileSystem.documentDirectory}${filename}`;
    
    await FileSystem.writeAsStringAsync(filepath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filepath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export NutriScanVN Data',
        UTI: 'public.comma-separated-values-text',
      });
    }
  } catch (error) {
    console.error('Export CSV error:', error);
    throw new Error('Không thể export dữ liệu CSV');
  }
};

/**
 * Export data to JSON format
 */
export const exportToJSON = async (data: ExportData): Promise<void> => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);

    const filename = `nutriscanvn_export_${Date.now()}.json`;
    const filepath = `${FileSystem.documentDirectory}${filename}`;
    
    await FileSystem.writeAsStringAsync(filepath, jsonContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filepath, {
        mimeType: 'application/json',
        dialogTitle: 'Export NutriScanVN Data',
      });
    }
  } catch (error) {
    console.error('Export JSON error:', error);
    throw new Error('Không thể export dữ liệu JSON');
  }
};

/**
 * Generate PDF report (simplified - would use react-native-pdf in real app)
 */
export const exportToPDF = async (data: ExportData): Promise<void> => {
  try {
    // In a real implementation, use libraries like:
    // - react-native-pdf
    // - react-native-html-to-pdf
    // - expo-print
    
    // For now, create HTML and convert to PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>NutriScanVN Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #4CAF50; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
        </style>
      </head>
      <body>
        <h1>NutriScanVN - Báo Cáo Dinh Dưỡng</h1>
        <p>Từ ngày: ${data.startDate} đến ${data.endDate}</p>
    `;

    // Food Logs Table
    if (data.foodLogs && data.foodLogs.length > 0) {
      htmlContent += `
        <h2>Nhật Ký Thực Phẩm</h2>
        <table>
          <tr>
            <th>Ngày</th>
            <th>Bữa ăn</th>
            <th>Thực phẩm</th>
            <th>Calories</th>
            <th>Protein</th>
            <th>Carbs</th>
            <th>Fats</th>
          </tr>
      `;
      
      data.foodLogs.forEach((log) => {
        htmlContent += `
          <tr>
            <td>${formatDate(log.loggedAt)}</td>
            <td>${log.mealType}</td>
            <td>${log.foodName}</td>
            <td>${formatCalories(log.calories)}</td>
            <td>${formatMacros(log.protein)}</td>
            <td>${formatMacros(log.carbohydrates)}</td>
            <td>${formatMacros(log.fats)}</td>
          </tr>
        `;
      });
      
      htmlContent += '</table>';
    }

    htmlContent += `
      </body>
      </html>
    `;

    // Save HTML (in real app, convert to PDF)
    const filename = `nutriscanvn_report_${Date.now()}.html`;
    const filepath = `${FileSystem.documentDirectory}${filename}`;
    
    await FileSystem.writeAsStringAsync(filepath, htmlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filepath, {
        mimeType: 'text/html',
        dialogTitle: 'NutriScanVN Report',
      });
    }
  } catch (error) {
    console.error('Export PDF error:', error);
    throw new Error('Không thể export PDF');
  }
};

/**
 * Export all data in multiple formats
 */
export const exportAllData = async (format: 'csv' | 'json' | 'pdf', data: ExportData): Promise<void> => {
  switch (format) {
    case 'csv':
      await exportToCSV(data);
      break;
    case 'json':
      await exportToJSON(data);
      break;
    case 'pdf':
      await exportToPDF(data);
      break;
    default:
      throw new Error('Unsupported export format');
  }
};

export default {
  exportToCSV,
  exportToJSON,
  exportToPDF,
  exportAllData,
};

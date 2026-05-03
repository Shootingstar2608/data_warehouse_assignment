// frontend/src/app/utils/statistics.ts

/**
 * Hàm tính Tứ phân vị (Min, Q1, Median, Q3, Max) cho biểu đồ Boxplot
 * Bỏ qua các giá trị null/undefined
 */
export function getQuartiles(data: any[], key: string) {
  // Lọc lấy các giá trị hợp lệ và sắp xếp tăng dần
  const values = data
    .map(item => item[key])
    .filter(val => val !== null && val !== undefined && !isNaN(val))
    .sort((a, b) => a - b);

  if (values.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };

  const min = values[0];
  const max = values[values.length - 1];
  
  // Công thức tính index gần đúng cho tứ phân vị
  const q1 = values[Math.floor(values.length * 0.25)];
  const median = values[Math.floor(values.length * 0.5)];
  const q3 = values[Math.floor(values.length * 0.75)];

  return { min, q1, median, q3, max };
}

/**
 * Hàm tính Hệ số tương quan Pearson (Pearson Correlation Coefficient) giữa 2 biến
 * Trả về giá trị từ -1 đến 1
 */
export function getPearsonCorrelation(data: any[], keyX: string, keyY: string) {
  // Lọc ra các dòng mà cả 2 biến đều có dữ liệu
  const validData = data.filter(
    item => item[keyX] != null && !isNaN(item[keyX]) && item[keyY] != null && !isNaN(item[keyY])
  );

  const n = validData.length;
  if (n === 0) return 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  validData.forEach(item => {
    const x = item[keyX];
    const y = item[keyY];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  });

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Hàm tạo Ma trận tương quan (Correlation Matrix) cho danh sách các biến
 */
export function generateCorrelationMatrix(data: any[], variables: {key: string, label: string}[]) {
  return variables.map(varY => {
    const row: any = { var: varY.label };
    variables.forEach(varX => {
      // Nếu là chính nó thì tương quan luôn là 1.0
      if (varX.key === varY.key) {
        row[varX.label] = 1.0;
      } else {
        row[varX.label] = getPearsonCorrelation(data, varX.key, varY.key);
      }
    });
    return row;
  });
}
import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter 
} from 'recharts';

// Import file JSON
import rawJson from '../data/eda_results.json';
import { getQuartiles, generateCorrelationMatrix } from '../utils/statistics';

const getCorrelationColor = (value: number) => {
  const intensity = Math.abs(value);
  if (value >= 0) return `rgba(14, 165, 233, ${intensity})`;
  return `rgba(251, 146, 60, ${intensity})`;
};

export function DashboardTab() {
  const [dataStats, setDataStats] = useState<any>(null);

  useEffect(() => {
    // 1. Gỡ lớp bọc "data" của Pentaho để lấy mảng thực sự
    // @ts-ignore - Bỏ qua cảnh báo strict type của TypeScript cho file JSON import
    const rawArray = rawJson.data ? rawJson.data : rawJson;
    
    if (!rawArray || !Array.isArray(rawArray) || rawArray.length === 0) return;

    // 2. Chuẩn hóa tất cả tên cột (In hoa -> In thường) để biểu đồ đọc được
    const dataset = rawArray.map((d: any) => ({
      ph: d.ph ?? d.PH ?? d.Ph,
      hardness: d.Hardness ?? d.hardness,
      solids: d.Solids ?? d.solids,
      chloramines: d.Chloramines ?? d.chloramines,
      sulfate: d.Sulfate ?? d.sulfate,
      conductivity: d.Conductivity ?? d.conductivity,
      organic_carbon: d.Organic_carbon ?? d.organic_carbon,
      trihalomethanes: d.Trihalomethanes ?? d.trihalomethanes,
      turbidity: d.Turbidity ?? d.turbidity,
      potability: d.Potability ?? d.potability ?? d.fk_potability,
    }));

    // --- 1. Dữ liệu Pie Chart ---
    const safeData = dataset.filter((d: any) => d.potability === 1);
    const unsafeData = dataset.filter((d: any) => d.potability === 0);
    
    const potabilityData = [
      { name: 'An toàn', value: safeData.length, color: '#0ea5e9' },
      { name: 'Không an toàn', value: unsafeData.length, color: '#38bdf8' }
    ];

    // --- 2. Dữ liệu Bar Chart ---
    const phRanges = [0, 0, 0, 0, 0, 0, 0]; 
    dataset.forEach((d: any) => {
      const ph = d.ph;
      if (ph != null && !isNaN(ph)) {
        if (ph < 2) phRanges[0]++;
        else if (ph < 4) phRanges[1]++;
        else if (ph < 6) phRanges[2]++;
        else if (ph < 8) phRanges[3]++;
        else if (ph < 10) phRanges[4]++;
        else if (ph < 12) phRanges[5]++;
        else phRanges[6]++;
      }
    });
    const phDistribution = [
      { range: '0-2', count: phRanges[0] }, { range: '2-4', count: phRanges[1] },
      { range: '4-6', count: phRanges[2] }, { range: '6-8', count: phRanges[3] },
      { range: '8-10', count: phRanges[4] }, { range: '10-12', count: phRanges[5] },
      { range: '12-14', count: phRanges[6] }
    ];

    // --- 3. Dữ liệu Boxplot (Hardness) ---
    const unsafeHardness = getQuartiles(unsafeData, 'hardness');
    const safeHardness = getQuartiles(safeData, 'hardness');
    const hardnessBoxplot = [
      { category: 'Không an toàn', ...unsafeHardness },
      { category: 'An toàn', ...safeHardness }
    ];

    // --- 4. Ma trận tương quan ---
    const variables = [
      { key: 'ph', label: 'pH' }, { key: 'hardness', label: 'Hard' },
      { key: 'solids', label: 'Solid' }, { key: 'chloramines', label: 'Chlor' },
      { key: 'sulfate', label: 'Sulf' }, { key: 'conductivity', label: 'Cond' },
      { key: 'organic_carbon', label: 'Org' }, { key: 'trihalomethanes', label: 'Trihal' },
      { key: 'turbidity', label: 'Turb' }, { key: 'potability', label: 'Pot' }
    ];
    const correlationMatrix = generateCorrelationMatrix(dataset, variables);

    setDataStats({
      total: dataset.length,
      safePercent: ((safeData.length / dataset.length) * 100).toFixed(0),
      unsafePercent: ((unsafeData.length / dataset.length) * 100).toFixed(0),
      potabilityData, phDistribution, hardnessBoxplot, correlationMatrix, variables,
      scatterData: dataset
    });
  }, []);

  if (!dataStats) return <div className="p-8 text-center text-gray-500">Đang phân tích dữ liệu kho...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard / Phân Tích Dữ Liệu Thực Tế</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Tổng quan */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông Tin Bộ Dữ Liệu</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-cyan-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">Số mẫu</div>
              <div className="text-3xl font-bold text-cyan-600">{dataStats.total}</div>
            </div>
            <div className="bg-sky-50 rounded-lg p-4">
              <div className="text-sm text-gray-600">% An toàn</div>
              <div className="text-3xl font-bold text-sky-600">{dataStats.safePercent}%</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataStats.potabilityData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                  {dataStats.potabilityData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Phân bố pH */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Phân Bố Độ pH</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataStats.phDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Boxplot */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Phân Bố Độ Cứng (Hardness)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataStats.hardnessBoxplot} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={['auto', 'auto']} />
                <YAxis type="category" dataKey="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="min" stackId="a" fill="#7dd3fc" name="Giá trị nhỏ nhất" />
                <Bar dataKey="q1" stackId="a" fill="#0ea5e9" name="Tứ phân vị 1" />
                <Bar dataKey="median" stackId="a" fill="#0369a1" name="Trung vị" />
                <Bar dataKey="q3" stackId="a" fill="#0ea5e9" name="Tứ phân vị 3" />
                <Bar dataKey="max" stackId="a" fill="#7dd3fc" name="Giá trị lớn nhất" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Heatmap */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ma Trận Tương Quan Pearson</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr>
                  <th className="p-1 border border-gray-200 bg-gray-50"></th>
                  {dataStats.variables.map((v: any) => (
                    <th key={v.label} className="p-1 border border-gray-200 bg-gray-50">{v.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataStats.correlationMatrix.map((row: any, i: number) => (
                  <tr key={i}>
                    <td className="p-1 border border-gray-200 font-bold bg-gray-50">{row.var}</td>
                    {dataStats.variables.map((v: any) => (
                      <td key={v.label} className="p-1 border border-gray-200 text-center" style={{ backgroundColor: getCorrelationColor(row[v.label]) }}>
                        {row[v.label].toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 5: Scatter */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 lg:col-span-2">
           <h2 className="text-xl font-semibold text-gray-800 mb-4">pH vs Sulfate (Phân loại theo Độ An Toàn)</h2>
           <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart 
                  // Tăng margin bên trái (left) và bên dưới (bottom) để có chỗ cho số và chữ
                  margin={{ top: 20, right: 30, bottom: 60, left: 70 }} 
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  
                  <XAxis 
                    dataKey="ph" 
                    type="number" 
                    name="Độ pH" 
                    domain={['auto', 'auto']} 
                    // Đẩy chữ "Độ pH" xuống thấp hẳn (-40) để không dính vào số
                    label={{ value: 'Độ pH', position: 'insideBottom', offset: -40, fill: '#374151', fontSize: 14 }}
                    tick={{ fontSize: 12, dy: 10 }} // Đẩy các con số trên trục X xuống một chút
                  />
                  
                  <YAxis 
                    dataKey="sulfate" 
                    type="number" 
                    name="Sulfate" 
                    domain={['auto', 'auto']} 
                    // Đẩy "Sulfate (mg/L)" ra xa bên trái (-55) để không dính vào số 160 hay số 0
                    label={{ 
                      value: 'Sulfate (mg/L)', 
                      angle: -90, 
                      position: 'insideLeft', 
                      offset: -55, 
                      fill: '#374151', 
                      fontSize: 14 
                    }} 
                    tick={{ fontSize: 12, dx: -10 }} // Đẩy các con số trên trục Y (như 160, 0) ra bên trái một chút
                  />
                  
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend verticalAlign="top" height={50} />
                  
                  <Scatter 
                    name="Không an toàn" 
                    data={dataStats.scatterData.filter((d: any) => d.potability === 0)} 
                    fill="#d97706" 
                    opacity={0.7} 
                  />
                  <Scatter 
                    name="An toàn" 
                    data={dataStats.scatterData.filter((d: any) => d.potability === 1)} 
                    fill="#0284c7" 
                    opacity={0.7} 
                  />
                </ScatterChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}
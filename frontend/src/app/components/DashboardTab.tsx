import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter 
} from 'recharts';

// Gộp import file JSON thành 1 để dùng chung cho cả 2 phần
import edaData from '../data/eda_results.json';
import { getQuartiles, generateCorrelationMatrix } from '../utils/statistics';

// Hàm helper của Dashboard
const getCorrelationColor = (value: number) => {
  const intensity = Math.abs(value);
  if (value >= 0) return `rgba(14, 165, 233, ${intensity})`;
  return `rgba(251, 146, 60, ${intensity})`;
};

export function DashboardTab() {
  // ==========================================
  // 1. STATE & LOGIC CỦA DASHBOARD TAB
  // ==========================================
  const [dataStats, setDataStats] = useState<any>(null);

  useEffect(() => {
    // Sử dụng edaData thay vì rawJson
    const rawArray = edaData.data ? edaData.data : edaData;
    
    if (!rawArray || !Array.isArray(rawArray) || rawArray.length === 0) return;

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

    const safeData = dataset.filter((d: any) => d.potability === 1);
    const unsafeData = dataset.filter((d: any) => d.potability === 0);
    
    const potabilityData = [
      { name: 'An toàn', value: safeData.length, color: '#0ea5e9' },
      { name: 'Không an toàn', value: unsafeData.length, color: '#38bdf8' }
    ];

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

    const unsafeHardness = getQuartiles(unsafeData, 'hardness');
    const safeHardness = getQuartiles(safeData, 'hardness');
    const hardnessBoxplot = [
      { category: 'Không an toàn', ...unsafeHardness },
      { category: 'An toàn', ...safeHardness }
    ];

    // Tính toán trung bình các chỉ số cho biểu đồ mới
    const compareFeatures = ['ph', 'chloramines', 'organic_carbon', 'turbidity'];
    const averageData = compareFeatures.map(feat => {
       const safeSum = safeData.reduce((sum: number, d: any) => sum + (d[feat] || 0), 0);
       const unsafeSum = unsafeData.reduce((sum: number, d: any) => sum + (d[feat] || 0), 0);
       return {
          name: feat === 'ph' ? 'pH' : feat.charAt(0).toUpperCase() + feat.slice(1).replace('_', ' '),
          safeAvg: parseFloat((safeSum / (safeData.length || 1)).toFixed(2)),
          unsafeAvg: parseFloat((unsafeSum / (unsafeData.length || 1)).toFixed(2))
       };
    });

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
      scatterData: dataset,
      averageData
    });
  }, []);

  // ==========================================
  // 2. STATE & LOGIC CỦA ML TAB
  // ==========================================
  const [formData, setFormData] = useState({
    ph: 7.0, Hardness: 150, Solids: 20000, Chloramines: 7.0,
    Sulfate: 300, Conductivity: 400, Organic_carbon: 15,
    Trihalomethanes: 60, Turbidity: 4.0
  });

  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const ranges = useMemo(() => {
    const data = edaData.data ? edaData.data : edaData;
    const computedRanges: Record<string, { min: number, max: number }> = {
      ph: { min: Infinity, max: -Infinity },
      Hardness: { min: Infinity, max: -Infinity },
      Solids: { min: Infinity, max: -Infinity },
      Chloramines: { min: Infinity, max: -Infinity },
      Sulfate: { min: Infinity, max: -Infinity },
      Conductivity: { min: Infinity, max: -Infinity },
      Organic_carbon: { min: Infinity, max: -Infinity },
      Trihalomethanes: { min: Infinity, max: -Infinity },
      Turbidity: { min: Infinity, max: -Infinity }
    };

    if (Array.isArray(data)) {
      data.forEach((row: any) => {
        Object.keys(computedRanges).forEach((key) => {
          const val = row[key] ?? row[key.toLowerCase()];
          if (val !== undefined && val !== null) {
            if (val < computedRanges[key].min) computedRanges[key].min = val;
            if (val > computedRanges[key].max) computedRanges[key].max = val;
          }
        });
      });
    }

    Object.keys(computedRanges).forEach(key => {
      if (computedRanges[key].min === Infinity) computedRanges[key].min = 0;
      if (computedRanges[key].max === -Infinity) computedRanges[key].max = 100;
    });

    return computedRanges;
  }, []);

  const handleChange = (key: string, value: string) => {
    if (value === '') {
      setFormData(prev => ({ ...prev, [key]: 0 }));
      return;
    }

    let val = parseFloat(value);
    const { min, max } = ranges[key];

    if (!isNaN(val)) {
      if (val < min) val = min;
      if (val > max) val = max;
    }

    setFormData(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const calculateKeys = () => {
    let acidity = 2; 
    if (formData.ph < 6.5) acidity = 1;
    else if (formData.ph > 8.5) acidity = 3;

    let hardness = 4;
    if (formData.Hardness < 60) hardness = 1;
    else if (formData.Hardness < 120) hardness = 2;
    else if (formData.Hardness < 180) hardness = 3;

    return { acidity, hardness };
  };

  const handlePredict = async () => {
    setLoading(true);
    const { acidity, hardness } = calculateKeys();
    
    const payload = {
      solids: formData.Solids,
      chloramines: formData.Chloramines,
      sulfate: formData.Sulfate,
      conductivity: formData.Conductivity,
      organic_carbon: formData.Organic_carbon,
      trihalomethanes: formData.Trihalomethanes,
      turbidity: formData.Turbidity,
      acidity_key: acidity,
      hardness_key: hardness
    };

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      setPrediction(data.potability);
    } catch (error) {
      alert("Lỗi kết nối API! Hãy kiểm tra Backend.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. RENDER UI GỘP
  // ==========================================
  if (!dataStats) return <div className="p-8 text-center text-gray-500">Đang phân tích dữ liệu kho...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-12">
      
      {/* --- PHẦN 1: DASHBOARD TAB (NẰM TRÊN) --- */}
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Phân Tích Dữ Liệu</h1>
        
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
                <BarChart data={dataStats.phDistribution} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="range" 
                    label={{ value: 'Độ pH', position: 'insideBottom', offset: -15, fontSize: 14, fill: '#4b5563' }} 
                  />
                  <YAxis 
                    label={{ value: 'Số lượng mẫu', angle: -90, position: 'insideLeft', offset: 0, fontSize: 14, fill: '#4b5563' }} 
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Boxplot */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Phân Bố Độ Cứng</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataStats.hardnessBoxplot} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={['auto', 'auto']} />
                  <YAxis type="category" dataKey="category" width={150} />
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
             <h2 className="text-xl font-semibold text-gray-800 mb-4">Phân Loại Độ An Toàn Theo Độ pH Và Sulfate</h2>
             <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="ph" type="number" name="Độ pH" domain={['auto', 'auto']} 
                      label={{ value: 'Độ pH', position: 'insideBottom', offset: -25, fill: '#374151', fontSize: 14 }}
                      tick={{ fontSize: 12, dy: 5 }}
                    />
                    <YAxis 
                      dataKey="sulfate" type="number" name="Sulfate" domain={['auto', 'auto']} 
                      label={{ value: 'Sulfate (mg/L)', angle: -90, position: 'insideLeft', offset: -10, fill: '#374151', fontSize: 14 }} 
                      tick={{ fontSize: 12, dx: -5 }} 
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend verticalAlign="top" height={50} />
                    <Scatter name="Không an toàn" data={dataStats.scatterData.filter((d: any) => d.potability === 0)} fill="#d97706" opacity={0.7} />
                    <Scatter name="An toàn" data={dataStats.scatterData.filter((d: any) => d.potability === 1)} fill="#0284c7" opacity={0.7} />
                  </ScatterChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Card 6: Bổ sung So sánh trung bình (Mới) */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Trung Bình Các Chỉ Số Chính</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataStats.averageData} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    label={{ value: 'Chỉ số', position: 'insideBottom', offset: -15, fontSize: 14, fill: '#4b5563' }} 
                  />
                  <YAxis 
                    label={{ value: 'Giá trị trung bình', angle: -90, position: 'insideLeft', offset: -5, fontSize: 14, fill: '#4b5563' }} 
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="safeAvg" name="Nguồn An Toàn" fill="#c084fc" /> 
                  <Bar dataKey="unsafeAvg" name="Nguồn Không An Toàn" fill="#9ca3af" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 7: Bổ sung Tương quan Chloramines & Organic Carbon (Mới) */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Phân Loại Độ An Toàn Theo Chloramines Và Organic Carbon</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="chloramines" type="number" name="Chloramines" 
                    label={{ value: 'Chloramines (mg/L)', position: 'insideBottom', offset: -15, fill: '#374151', fontSize: 14 }} 
                  />
                  <YAxis 
                    dataKey="organic_carbon" type="number" name="Organic Carbon" 
                    label={{ value: 'Organic Carbon', angle: -90, position: 'insideLeft', offset: 0, fill: '#374151', fontSize: 14 }} 
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Scatter name="Không an toàn" data={dataStats.scatterData.filter((d: any) => d.potability === 0)} fill="#f87171" opacity={0.6} />
                  <Scatter name="An toàn" data={dataStats.scatterData.filter((d: any) => d.potability === 1)} fill="#f0abfc" opacity={0.8} /> 
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* --- ĐƯỜNG KẺ PHÂN CÁCH TRỰC QUAN --- */}
      <hr className="border-t border-gray-300 my-8 max-w-7xl mx-auto" />

      {/* --- PHẦN 2: ML TAB (NẰM DƯỚI) --- */}
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Dự đoán Chất lượng nước</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột nhập liệu (Chiếm 2 phần) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">THÔNG SỐ ĐẦU VÀO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.keys(formData).map((key) => {
                const currentValue = formData[key as keyof typeof formData];
                const { min, max } = ranges[key];
                const step = key === 'Solids' ? "1" : "0.01";

                // Đã bỏ class `capitalize` thay bằng JS logic để giữ đúng tên "pH"
                const displayLabel = key.toLowerCase() === 'ph' ? 'pH' : key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');

                return (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">
                      {displayLabel}
                      <span className="text-xs font-normal text-gray-400 ml-2">({min.toFixed(1)} - {max.toFixed(1)})</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={currentValue}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={currentValue === 0 ? '' : currentValue}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 text-center"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={handlePredict}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 mt-4 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
            >
              {loading ? "ĐANG DỰ ĐOÁN..." : "DỰ ĐOÁN"}
            </button>
          </div>

          {/* Cột kết quả & Đánh giá (Chiếm 1 phần) */}
          <div className="space-y-6">
            {/* Card Dự đoán */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[250px]">
              {prediction === null ? (
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="italic text-sm">Chưa có dữ liệu dự đoán</p>
                </div>
              ) : (
                <div className="text-center animate-fade-in">
                  <div className={`text-6xl mb-4 ${prediction === 1 ? 'text-green-500' : 'text-red-500'}`}>
                    {prediction === 1 ? '💧' : '⚠️'}
                  </div>
                  <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Kết quả phân tích</p>
                  <h3 className={`text-2xl font-black ${prediction === 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {prediction === 1 ? "AN TOÀN" : "KHÔNG AN TOÀN"}
                  </h3>
                </div>
              )}
            </div>

            {/* Card Chỉ số Model (Hardcoded) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 border-b pb-2 mb-4 text-sm uppercase tracking-wider">Đánh giá mô hình</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[10px] text-blue-600 font-bold uppercase">Accuracy</p>
                  <p className="text-xl font-black text-blue-800">80.77%</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="text-[10px] text-indigo-600 font-bold uppercase">Precision</p>
                  <p className="text-xl font-black text-indigo-800">98.22</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-[10px] text-purple-600 font-bold uppercase">Recall</p>
                  <p className="text-xl font-black text-purple-800">51.72</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <p className="text-[10px] text-teal-600 font-bold uppercase">F1-Score</p>
                  <p className="text-xl font-black text-teal-800">67.76</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 text-center italic">
                Model: Random Forest Classifier
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
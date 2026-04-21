import React, { useState, useMemo } from 'react';
// Đảm bảo file json nằm đúng đường dẫn frontend/src/app/data/
import edaData from '../data/eda_results.json'; 

export function MLTab() {
  const [formData, setFormData] = useState({
    ph: 7.0, Hardness: 150, Solids: 20000, Chloramines: 7.0,
    Sulfate: 300, Conductivity: 400, Organic_carbon: 15,
    Trihalomethanes: 60, Turbidity: 4.0
  });

  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Lấy giá trị min/max tự động từ bộ dataset
  const ranges = useMemo(() => {
    const data = edaData.data;
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

    data.forEach((row: any) => {
      Object.keys(computedRanges).forEach((key) => {
        const val = row[key];
        if (val !== undefined && val !== null) {
          if (val < computedRanges[key].min) computedRanges[key].min = val;
          if (val > computedRanges[key].max) computedRanges[key].max = val;
        }
      });
    });

    return computedRanges;
  }, []);

  // Hàm xử lý thay đổi value và đồng bộ hóa Max/Min
  const handleChange = (key: string, value: string) => {
    if (value === '') {
      setFormData(prev => ({ ...prev, [key]: 0 }));
      return;
    }

    let val = parseFloat(value);
    const { min, max } = ranges[key];

    // Tự động set lại về max/min nếu nhập ngoài khoảng
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Phân tích & Dự đoán Chất lượng nước</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột nhập liệu (Chiếm 2 phần) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
            <h2 className="font-semibold text-lg border-b pb-2 mb-4">Thông số đầu vào</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.keys(formData).map((key) => {
                const currentValue = formData[key as keyof typeof formData];
                const { min, max } = ranges[key];
                const step = key === 'Solids' ? "1" : "0.01";

                return (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block capitalize">
                      {key.replace('_', ' ')} 
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
              {loading ? "ĐANG XỬ LÝ..." : "XỬ LÝ DỰ ĐOÁN"}
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
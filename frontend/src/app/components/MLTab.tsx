import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const models = [
  'Random Forest',
  'Decision Tree',
  'Support Vector Machine (SVM)',
  'Gradient Boosting',
  'Logistic Regression',
  'K-Nearest Neighbors (KNN)'
];

const features = [
  'ph',
  'Hardness',
  'Solids',
  'Chloramines',
  'Sulfate',
  'Conductivity',
  'Organic_carbon',
  'Trihalomethanes',
  'Turbidity'
];

export function MLTab() {
  const [selectedModel, setSelectedModel] = useState('Random Forest');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(features);
  const [testSize, setTestSize] = useState(20);
  const [randomSeed, setRandomSeed] = useState(42);
  const [numTrees, setNumTrees] = useState(100);
  const [maxDepth, setMaxDepth] = useState(10);
  const [trained, setTrained] = useState(false);

  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleTrain = () => {
    setTrained(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Huấn Luyện Mô Hình ML / Xác Định Độ An Toàn</h1>
      {/* Section 2: Model & Parameters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Chọn Mô Hình & Tham Số</h2>
        
        <div className="space-y-4">
          {/* Model selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn mô hình ML</label>
            <div className="relative">
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Dynamic parameters based on selected model */}
          {selectedModel === 'Random Forest' && (
            <div className="space-y-4 p-4 bg-cyan-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số cây: {numTrees}
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={numTrees}
                  onChange={(e) => setNumTrees(Number(e.target.value))}
                  className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Độ sâu tối đa: {maxDepth}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
            </div>
          )}

          {selectedModel === 'Decision Tree' && (
            <div className="space-y-4 p-4 bg-cyan-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Độ sâu tối đa: {maxDepth}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Training & Results */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Huấn Luyện & Kết Quả</h2>
        
        <button
          onClick={handleTrain}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-6"
        >
          Huấn Luyện Mô Hình
        </button>

        {trained && (
          <div className="space-y-6">
            {/* Metrics Table */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Kết Quả Trên Tập Test</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-cyan-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Độ đo</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Accuracy (Độ chính xác)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-cyan-700">0.6835</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">Precision (Độ chính xác dương)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-cyan-700">0.6721</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Recall (Độ nhạy)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-cyan-700">0.6542</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">F1-Score</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-cyan-700">0.6630</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Ma Trận Nhầm Lẫn (Confusion Matrix)</h3>
              <div className="inline-block">
                <table className="border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-100"></th>
                      <th className="border border-gray-300 px-4 py-2 bg-cyan-100 text-center" colSpan={2}>Dự đoán</th>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 bg-gray-100"></th>
                      <th className="border border-gray-300 px-4 py-2 bg-cyan-50 text-center">Không an toàn</th>
                      <th className="border border-gray-300 px-4 py-2 bg-cyan-50 text-center">An toàn</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 bg-cyan-50 text-left" rowSpan={2}>Thực tế</th>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 bg-cyan-50 font-medium">Không an toàn</td>
                      <td className="border border-gray-300 px-6 py-3 text-center bg-green-100 font-semibold text-lg">256</td>
                      <td className="border border-gray-300 px-6 py-3 text-center bg-red-100 font-semibold text-lg">108</td>
                    </tr>
                    <tr>
                      <td></td>
                      <td className="border border-gray-300 px-4 py-2 bg-cyan-50 font-medium">An toàn</td>
                      <td className="border border-gray-300 px-6 py-3 text-center bg-red-100 font-semibold text-lg">99</td>
                      <td className="border border-gray-300 px-6 py-3 text-center bg-green-100 font-semibold text-lg">193</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-2 text-xs text-gray-600">
                  <p>TN (True Negative): 256 | FP (False Positive): 108</p>
                  <p>FN (False Negative): 99 | TP (True Positive): 193</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

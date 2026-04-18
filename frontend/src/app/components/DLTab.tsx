import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const activationFunctions = ['ReLU', 'Sigmoid', 'Tanh', 'LeakyReLU', 'Softmax'];
const optimizers = ['Adam', 'SGD', 'RMSprop', 'Adagrad'];

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

// Mock training data
const trainingData = [
  { epoch: 1, trainLoss: 0.68, valLoss: 0.67, trainAcc: 0.52, valAcc: 0.53 },
  { epoch: 2, trainLoss: 0.65, valLoss: 0.64, trainAcc: 0.58, valAcc: 0.59 },
  { epoch: 3, trainLoss: 0.62, valLoss: 0.62, trainAcc: 0.62, valAcc: 0.61 },
  { epoch: 4, trainLoss: 0.58, valLoss: 0.60, trainAcc: 0.66, valAcc: 0.64 },
  { epoch: 5, trainLoss: 0.55, valLoss: 0.59, trainAcc: 0.69, valAcc: 0.66 },
  { epoch: 6, trainLoss: 0.52, valLoss: 0.58, trainAcc: 0.72, valAcc: 0.68 },
  { epoch: 7, trainLoss: 0.49, valLoss: 0.57, trainAcc: 0.74, valAcc: 0.69 },
  { epoch: 8, trainLoss: 0.46, valLoss: 0.57, trainAcc: 0.77, valAcc: 0.70 },
  { epoch: 9, trainLoss: 0.43, valLoss: 0.57, trainAcc: 0.79, valAcc: 0.70 },
  { epoch: 10, trainLoss: 0.40, valLoss: 0.58, trainAcc: 0.81, valAcc: 0.69 },
];

export function DLTab() {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(features);
  const [testSize, setTestSize] = useState(20);
  const [randomSeed, setRandomSeed] = useState(42);
  const [numHiddenLayers, setNumHiddenLayers] = useState(2);
  const [activation, setActivation] = useState('ReLU');
  const [batchSize, setBatchSize] = useState(32);
  const [epochs, setEpochs] = useState(10);
  const [learningRate, setLearningRate] = useState(0.001);
  const [optimizer, setOptimizer] = useState('Adam');
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
      <h1 className="text-3xl font-bold text-gray-800">Huấn Luyện Mô Hình Học Sâu / Xác Định Độ An Toàn</h1>
      
      {/* Section 1: Data & Architecture Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cấu Hình Dữ Liệu & Kiến Trúc</h2>
        
        <div className="space-y-4">
          {/* Feature selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn các biến đầu vào</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {features.map(feature => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Test size slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tỷ lệ tập Test (%): {testSize}%
            </label>
            <input
              type="range"
              min="10"
              max="40"
              value={testSize}
              onChange={(e) => setTestSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
          </div>

          {/* Random seed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Seed ngẫu nhiên</label>
            <input
              type="number"
              value={randomSeed}
              onChange={(e) => setRandomSeed(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Neural Network Architecture */}
          <div className="p-4 bg-cyan-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-800">Thiết Kế Kiến Trúc Mạng Neural</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lớp ẩn: {numHiddenLayers}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={numHiddenLayers}
                onChange={(e) => setNumHiddenLayers(Number(e.target.value))}
                className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hàm kích hoạt (Activation)</label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={activation}
                  onChange={(e) => setActivation(e.target.value)}
                >
                  {activationFunctions.map(func => (
                    <option key={func} value={func}>{func}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Neural Network Diagram */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-around">
                {/* Input Layer */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-medium text-gray-600 mb-2">Input</div>
                  <div className="space-y-1">
                    {[...Array(Math.min(selectedFeatures.length, 4))].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-blue-200 border-2 border-blue-500"></div>
                    ))}
                    {selectedFeatures.length > 4 && <div className="text-center text-xs text-gray-500">...</div>}
                  </div>
                </div>

                {/* Hidden Layers */}
                {[...Array(numHiddenLayers)].map((_, layerIdx) => (
                  <div key={layerIdx} className="flex flex-col items-center">
                    <div className="text-xs font-medium text-gray-600 mb-2">Hidden {layerIdx + 1}</div>
                    <div className="space-y-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-cyan-200 border-2 border-cyan-500"></div>
                      ))}
                      <div className="text-center text-xs text-gray-500">...</div>
                    </div>
                  </div>
                ))}

                {/* Output Layer */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-medium text-gray-600 mb-2">Output</div>
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-green-200 border-2 border-green-500"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Training Parameters */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tham Số Huấn Luyện</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Batch Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Size: {batchSize}
            </label>
            <input
              type="range"
              min="8"
              max="128"
              step="8"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
          </div>

          {/* Epochs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Epochs: {epochs}
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={epochs}
              onChange={(e) => setEpochs(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />
          </div>

          {/* Learning Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Learning Rate</label>
            <input
              type="number"
              step="0.0001"
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Optimizer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Optimizer</label>
            <div className="relative">
              <select 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={optimizer}
                onChange={(e) => setOptimizer(e.target.value)}
              >
                {optimizers.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Training & Results */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Huấn Luyện & Kết Quả</h2>
        
        <button
          onClick={handleTrain}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-6"
        >
          Huấn Luyện Mô Hình Học Sâu
        </button>

        {trained && (
          <div className="space-y-6">
            {/* Loss Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Độ Mất Mát (Loss) qua Epochs</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" label={{ value: 'Epochs', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="trainLoss" stroke="#0ea5e9" name="Train Loss" strokeWidth={2} />
                    <Line type="monotone" dataKey="valLoss" stroke="#f59e0b" name="Val Loss" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Accuracy Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Độ Chính Xác (Accuracy) qua Epochs</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" label={{ value: 'Epochs', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }} domain={[0, 1]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="trainAcc" stroke="#0ea5e9" name="Train Accuracy" strokeWidth={2} />
                    <Line type="monotone" dataKey="valAcc" stroke="#10b981" name="Val Accuracy" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Final Test Results */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Kết Quả Cuối Cùng Trên Tập Test</h3>
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
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-cyan-700">0.7042</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">Precision (Độ chính xác dương)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-cyan-700">0.6894</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Recall (Độ nhạy)</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-cyan-700">0.6738</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">F1-Score</td>
                      <td className="border border-gray-300 px-4 py-2 text-center font-semibold text-cyan-700">0.6815</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

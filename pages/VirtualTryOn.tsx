
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/StoreContext';
import { geminiService } from '../services/gemini';
import { Product } from '../types';

const VirtualTryOn: React.FC = () => {
  const { products, addNotification, addToCart } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const tryOnProducts = products.filter(p => 
    p.category === 'Electronics' || 
    p.category === 'Accessories' || 
    p.category === 'Beauty' ||
    p.tags.includes('sunglasses')
  ).slice(0, 12);

  useEffect(() => {
    const initFaceMesh = async () => {
      const { FaceMesh } = (window as any);
      if (!FaceMesh) return;

      faceMeshRef.current = new FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMeshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMeshRef.current.onResults(onResults);
    };

    initFaceMesh();

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    try {
      const { Camera } = (window as any);
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current! });
          }
        },
        width: 640,
        height: 480,
      });
      await cameraRef.current.start();
      setIsCameraActive(true);
      addNotification('info', 'Biometric scanner active.');
    } catch (err) {
      addNotification('error', 'Camera access failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraRef.current) cameraRef.current.stop();
    setIsCameraActive(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
  };

  const onResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0 && selectedProduct) {
      const landmarks = results.multiFaceLandmarks[0];
      if (selectedProduct.category === 'Beauty' || selectedProduct.tags.includes('lipstick')) {
        drawLipstick(ctx, landmarks);
      } else {
        drawGlasses(ctx, landmarks);
      }
    }
    ctx.restore();
  };

  const drawGlasses = (ctx: CanvasRenderingContext2D, landmarks: any) => {
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const bridge = landmarks[168];
    const forehead = landmarks[10];
    
    const canvasWidth = canvasRef.current!.width;
    const canvasHeight = canvasRef.current!.height;

    const x = bridge.x * canvasWidth;
    const y = bridge.y * canvasHeight;

    const dist = Math.sqrt(
      Math.pow((rightEye.x - leftEye.x) * canvasWidth, 2) + 
      Math.pow((rightEye.y - leftEye.y) * canvasHeight, 2)
    );

    const tilt = Math.atan2(
      (rightEye.y - leftEye.y) * canvasHeight,
      (rightEye.x - leftEye.x) * canvasWidth
    );

    ctx.translate(x, y);
    ctx.rotate(tilt);
    
    const glassesWidth = dist * 2.8;
    const glassesHeight = glassesWidth * 0.35;

    // Stylish Designer Frames
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#0f172a';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
    
    // Left Lens
    ctx.beginPath();
    ctx.roundRect(-glassesWidth * 0.48, -glassesHeight / 2, glassesWidth * 0.42, glassesHeight, 15);
    ctx.stroke();
    ctx.fill();

    // Right Lens
    ctx.beginPath();
    ctx.roundRect(glassesWidth * 0.06, -glassesHeight / 2, glassesWidth * 0.42, glassesHeight, 15);
    ctx.stroke();
    ctx.fill();

    // High bridge
    ctx.beginPath();
    ctx.moveTo(-glassesWidth * 0.06, -5);
    ctx.quadraticCurveTo(0, -20, glassesWidth * 0.06, -5);
    ctx.stroke();
  };

  const drawLipstick = (ctx: CanvasRenderingContext2D, landmarks: any) => {
    const lipIndices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];
    const canvasWidth = canvasRef.current!.width;
    const canvasHeight = canvasRef.current!.height;

    ctx.fillStyle = 'rgba(225, 29, 72, 0.4)';
    ctx.beginPath();
    lipIndices.forEach((idx, i) => {
      const pt = landmarks[idx];
      if (i === 0) ctx.moveTo(pt.x * canvasWidth, pt.y * canvasHeight);
      else ctx.lineTo(pt.x * canvasWidth, pt.y * canvasHeight);
    });
    ctx.closePath();
    ctx.fill();
  };

  const handleCapture = async () => {
    if (!selectedProduct || !videoRef.current) return;
    setIsAnalyzing(true);
    
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = videoRef.current.videoWidth;
    captureCanvas.height = videoRef.current.videoHeight;
    const cctx = captureCanvas.getContext('2d')!;
    
    // Composite video + try-on
    cctx.save();
    cctx.scale(-1, 1);
    cctx.drawImage(videoRef.current, -captureCanvas.width, 0);
    cctx.restore();
    cctx.drawImage(canvasRef.current!, 0, 0);

    const base64 = captureCanvas.toDataURL('image/jpeg').split(',')[1];
    
    try {
      const advice = await geminiService.analyzeFace(base64, selectedProduct.name);
      setAiAdvice(advice);
      addNotification('success', 'Styling advice generated.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadSnapshot = () => {
    const link = document.createElement('a');
    link.download = `NovaMart-TryOn-${Date.now()}.png`;
    
    const composite = document.createElement('canvas');
    composite.width = 640;
    composite.height = 480;
    const cctx = composite.getContext('2d')!;
    
    cctx.save();
    cctx.scale(-1, 1);
    cctx.drawImage(videoRef.current!, -640, 0);
    cctx.restore();
    cctx.drawImage(canvasRef.current!, 0, 0);
    
    link.href = composite.toDataURL();
    link.click();
    addNotification('success', 'Look saved to gallery!');
  };

  return (
    <div className="max-w-7xl mx-auto py-10 lg:py-16 px-4 animate-in fade-in duration-700 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl lg:text-7xl font-black text-gray-900 tracking-tighter uppercase">Try-On <span className="text-indigo-600">Lab</span></h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] lg:text-xs">Real-Time Biometric Rendering • Gemini Style Engine</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-xl font-black tracking-tighter uppercase text-gray-900 border-b pb-4">Style Palette</h3>
            <div className="grid grid-cols-3 gap-4">
              {tryOnProducts.map(p => (
                <button 
                  key={p.id}
                  onClick={() => { setSelectedProduct(p); setAiAdvice(null); }}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-2 ${selectedProduct?.id === p.id ? 'border-indigo-600 bg-indigo-50 scale-105 shadow-lg' : 'border-transparent hover:border-gray-200'}`}
                >
                  <img src={p.image} className="w-full h-full object-cover rounded-xl" alt={p.name} />
                </button>
              ))}
            </div>
            {selectedProduct && (
              <div className="animate-in slide-in-from-top-4 space-y-4 pt-4">
                 <div className="bg-gray-900 text-white p-6 rounded-3xl">
                    <h4 className="text-sm font-black uppercase tracking-tight">{selectedProduct.name}</h4>
                    <p className="text-xl font-black text-indigo-400 mt-1">${selectedProduct.price}</p>
                 </div>
                 <button 
                  onClick={() => addToCart(selectedProduct)}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                 >
                   Add To Cart
                 </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="relative aspect-[4/3] bg-gray-900 rounded-[40px] lg:rounded-[64px] overflow-hidden shadow-2xl border-8 border-white group">
            {!isCameraActive && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 z-20">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-5xl animate-pulse">📷</div>
                <button 
                  onClick={startCamera}
                  className="bg-indigo-600 text-white px-12 py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all scale-110"
                >
                  Initiate Vision
                </button>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">WASM Face Tracking Ready</p>
              </div>
            )}

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-900/50 backdrop-blur-sm">
                   <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover mirror-mode" playsInline muted></video>
            <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"></canvas>

            {isCameraActive && (
                <div className="absolute top-8 right-8 flex flex-col gap-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={stopCamera} className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform">✕</button>
                    <button onClick={downloadSnapshot} className="w-14 h-14 bg-white text-gray-900 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform">💾</button>
                    <button onClick={handleCapture} disabled={isAnalyzing} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform disabled:opacity-50">
                      {isAnalyzing ? '...' : '✨'}
                    </button>
                </div>
            )}

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
               <div className="bg-black/40 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_green]"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">468 Landmarks Active</span>
               </div>
            </div>
          </div>

          {aiAdvice && (
            <div className="bg-indigo-50 border border-indigo-100 p-10 rounded-[48px] animate-in slide-in-from-bottom-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">👨‍🎨</span>
                <h4 className="text-indigo-900 font-black uppercase text-xs tracking-tight">AI Stylist Feedback</h4>
              </div>
              <p className="text-indigo-800 text-xl font-medium leading-relaxed italic">"{aiAdvice}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;

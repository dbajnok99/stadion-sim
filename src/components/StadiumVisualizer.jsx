import{ useRef, useEffect } from 'react';
import getStablePosition from '../functions/getStablePosition';

const StadiumVisualizer = ({ data, params, currentStep }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    const stepData = data[currentStep];
    if (!stepData) return;

    // --- 1. Draw Stadium (Field) ---
    const fieldHeight = height * 0.45;
    ctx.fillStyle = '#dcfce7'; // green-100
    ctx.fillRect(0, 0, width, fieldHeight);
    
    // Pitch lines (simple)
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, fieldHeight - 40);
    ctx.beginPath();
    ctx.arc(width/2, fieldHeight/2, 30, 0, Math.PI * 2);
    ctx.stroke();

    // --- 2. Draw Fans Inside (Dots) ---
    const insideCount = stepData.inside;
    ctx.fillStyle = '#166534'; // green-800
    // Draw a subset of dots to represent the crowd (e.g., 1 dot = 10 fans)
    const displayInside = Math.min(insideCount / 5, 2000); // Cap for performance
    
    for (let i = 0; i < displayInside; i++) {
      const pos = getStablePosition(i, 1, width - 40, fieldHeight - 40);
      ctx.beginPath();
      ctx.arc(20 + pos.x, 20 + pos.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 3. Draw Gates ---
    const gateY = fieldHeight;
    const gateAreaHeight = 30;
    const numGates = params.numGates;
    const gateWidth = (width - 40) / numGates;
    const numPriority = params.seasonTicketPriority 
      ? Math.max(1, Math.round(numGates * (params.seasonTicketPercent / 100))) 
      : 0;

    for (let i = 0; i < numGates; i++) {
      const x = 20 + i * gateWidth;
      const isPriority = i < numPriority;
      
      // Gate Box
      ctx.fillStyle = isPriority ? '#a5b4fc' : '#e2e8f0'; // indigo-200 or slate-200
      ctx.fillRect(x + 2, gateY, gateWidth - 4, gateAreaHeight);
      ctx.fillStyle = '#475569';
      ctx.font = '10px sans-serif';
      ctx.fillText(i + 1, x + gateWidth/2 - 3, gateY + 18);

      // --- 4. Draw Queue ---
      const queueLen = stepData.gateStats[i] || 0;
      // Visualize queue extending downwards
      const dotsPerCol = 15; // wrap queue visual
      const qDotSize = 2;
      const qGap = 2;
      
      ctx.fillStyle = isPriority ? '#4f46e5' : '#ea580c'; // indigo-600 or orange-600
      
      // Limit visual queue to keep it on screen
      const visualQ = Math.min(queueLen, 100); 
      
      for (let q = 0; q < visualQ; q++) {
        const col = Math.floor(q / dotsPerCol);
        const row = q % dotsPerCol;
        
        // Stacking downwards
        const qX = x + 4 + col * (qDotSize * 2 + 1);
        const qY = gateY + gateAreaHeight + 5 + row * (qDotSize * 2 + qGap);
        
        if (qX < x + gateWidth - 2) { // Only draw if fits in gate width
            ctx.beginPath();
            ctx.arc(qX, qY, qDotSize, 0, Math.PI * 2);
            ctx.fill();
        }
      }
    }

    // --- 5. Draw Arrivals (Bottom area) ---
    const arrivals = stepData.arrivals;
    ctx.fillStyle = '#3b82f6'; // blue-500
    
    // Scatter dots at bottom
    for (let i = 0; i < arrivals; i++) {
       // Randomize slightly based on frame to look like "walking"
       // Actually keep stable to avoid strobe, but shift based on time step
       const pos = getStablePosition(i, currentStep, width - 40, 40);
       ctx.beginPath();
       ctx.arc(20 + pos.x, height - 20 - (pos.y % 30), 2, 0, Math.PI * 2);
       ctx.fill();
    }
    
    // Label for Arrivals
    if (arrivals > 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Arriving: ${arrivals}/min`, width/2 - 40, height - 5);
    }

  }, [data, params, currentStep]);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={350} 
      style={{ width: '100%', height: '350px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
    />
  );
};

export default StadiumVisualizer;
import { useRef, useEffect } from 'react';
import getStablePosition from '../functions/getStablePosition';

const StadiumVisualizer = ({ data, params, currentStep }) => {
  const canvasRef = useRef(null);

  const getColor = (type) => {
    switch (type) {
      case 'ultra': return '#0f172a'; // Slate-900
      case 'season': return '#ca8a04'; // Yellow-700
      case 'normal': return '#2563eb'; // Blue-600
      default: return '#64748b';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;


    ctx.clearRect(0, 0, width, height);

    const stepData = data[currentStep];
    if (!stepData) return;

    // --- 1. Draw Stands (Concrete Areas) ---
    // Left Stand (Ultras)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, width * 0.25, height * 0.45);

    // Right Stand (Season)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(width * 0.75, 0, width * 0.25, height * 0.45);

    // Center Stand (Normal)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(width * 0.25, 0, width * 0.5, height * 0.15);

    // --- 2. Draw Pitch (Green Field) ---
    const fieldY = height * 0.15;
    const fieldHeight = height * 0.3;
    ctx.fillStyle = '#15803d';
    ctx.fillRect(width * 0.25, fieldY, width * 0.5, fieldHeight);

    // Pitch markings
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(width * 0.25 + 10, fieldY + 10, width * 0.5 - 20, fieldHeight - 20);
    ctx.beginPath();
    ctx.arc(width * 0.5, fieldY + fieldHeight / 2, 20, 0, Math.PI * 2);
    ctx.stroke();

    // --- 3. Populate Fans in Stands (Dots) ---
    const { normal, season, ultra, switchedInside } = stepData.insideStats;

    // Helper to draw group
    const drawGroup = (count, color, x, y, w, h) => {
      ctx.fillStyle = color;
      // Cap visual dots for performance (1 dot ~ 5 fans)
      const visualCount = Math.min(count / 5, (w * h) / 10);
      for (let i = 0; i < visualCount; i++) {
        const pos = getStablePosition(i, 1, w, h);
        ctx.beginPath();
        ctx.arc(x + pos.x, y + pos.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    drawGroup(ultra, getColor('ultra'), 10, 10, width * 0.25 - 20, height * 0.45 - 20);

    drawGroup(season, getColor('season'), width * 0.75 + 10, 10, width * 0.25 - 20, height * 0.45 - 20);

    drawGroup(Math.max(0, normal - (switchedInside || 0)), getColor('normal'), width * 0.25 + 10, 5, width * 0.5 - 20, height * 0.15 - 10);

    if (switchedInside > 0) {
      drawGroup(switchedInside, '#dc2626', width * 0.25 + 10, 5, width * 0.5 - 20, height * 0.15 - 10);
    }

    // --- 4. Draw Gates ---
    const gateY = height * 0.45;
    const gateAreaHeight = 30;
    const numGates = params.numGates;
    const numSeasonGates = params.numSeasonGates;
    const gateWidth = Math.max(5, (width - 40) / numGates);

    if (stepData.gateStats && stepData.gateStats.length > 0) {
      for (let i = 0; i < numGates; i++) {
        const x = 20 + i * gateWidth;
        const isPriority = i < numSeasonGates;

        ctx.fillStyle = isPriority ? '#a5b4fc' : '#cbd5e1';
        ctx.fillRect(x + 2, gateY, Math.max(3, gateWidth - 4), gateAreaHeight);
        ctx.fillStyle = '#475569';
        ctx.font = '10px sans-serif';
        if (gateWidth > 8) {
          ctx.fillText(i + 1, x + gateWidth / 2 - 3, gateY + 18);
        }

        const queueFans = (stepData.gateStats[i] && Array.isArray(stepData.gateStats[i])) ? stepData.gateStats[i] : [];
        const dotsPerCol = 15;
        const qDotSize = 2;
        const qGap = 2;

        const visualQ = Math.min(queueFans.length, 120);

        for (let q = 0; q < visualQ; q++) {
          const col = Math.floor(q / dotsPerCol);
          const row = q % dotsPerCol;

          const qX = x + 4 + col * (qDotSize * 2 + 1);
          const qY = gateY + gateAreaHeight + 5 + row * (qDotSize * 2 + qGap);

          if (qX < x + gateWidth - 2) {
            const fanData = queueFans[q];
            const type = fanData.type || fanData;
            const hasSwitched = fanData.hasSwitched || false;

            ctx.fillStyle = hasSwitched ? '#dc2626' : getColor(type); // Red-600 if switched
            ctx.beginPath();
            ctx.arc(qX, qY, qDotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // --- 6. Draw Arrivals (Bottom area) ---
    const arrivalTypes = stepData.arrivalTypes || [];

    for (let i = 0; i < arrivalTypes.length; i++) {
      const type = arrivalTypes[i];
      const pos = getStablePosition(i, currentStep, width - 40, 40);

      ctx.fillStyle = getColor(type);
      ctx.beginPath();
      ctx.arc(20 + pos.x, height - 20 - (pos.y % 30), 2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (arrivalTypes.length > 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Arriving: ${arrivalTypes.length}/min`, width / 2 - 40, height - 5);
    }

    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#0f172a'; ctx.fillText("ULTRAS", 10, 15);
    ctx.fillStyle = '#dc2626'; ctx.fillText("SWITCHED", width / 2 + 30, 15);
    ctx.fillStyle = '#b45309'; ctx.fillText("SEASON", width - 70, 15);
    ctx.fillStyle = '#1e3a8a'; ctx.fillText("GENERAL", width / 2 - 20, 15);

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
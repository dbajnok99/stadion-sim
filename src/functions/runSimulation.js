import generateBeta from './generateBeta';

const runSimulation = (config) => {
  const {
    numGates,
    totalFans,
    addUltras,
    overloadMode,
    seasonTicketPercent,
    seasonTicketPriority,
    impatientFans,
    distType,
    distParams
  } = config;

  const START_TIME = -120 * 60;
  const KICKOFF = 0;
  const END_TIME = overloadMode ? 120 * 60 : 60 * 60; 
  const actualFans = overloadMode ? totalFans + 2000 : totalFans;

  // --- Generate Arrivals ---
  let fans = [];
  
  const generators = {
    normal: () => {
      const meanSec = distParams.mean * 60;
      const stdDevSec = distParams.stdDev * 60;
      let t, attempts = 0;
      do {
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); while(v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        t = Math.floor(z * stdDevSec + meanSec);
        attempts++;
      } while ((t < START_TIME || t > KICKOFF) && attempts < 50);
      return attempts >= 50 ? Math.min(KICKOFF, Math.max(START_TIME, t)) : t;
    },
    uniform: () => {
      const startSec = distParams.start * 60;
      const endSec = distParams.end * 60;
      let t = Math.floor(Math.random() * (endSec - startSec) + startSec);
      return Math.min(KICKOFF, Math.max(START_TIME, t));
    },
    beta: () => {
      const range = KICKOFF - START_TIME;
      const betaVal = generateBeta(distParams.alpha, distParams.beta);
      return Math.floor(START_TIME + betaVal * range);
    }
  };

  for (let i = 0; i < actualFans; i++) {
    const isSeason = Math.random() < (seasonTicketPercent / 100);
    fans.push({
      id: i,
      type: isSeason ? 'season' : 'normal',
      arrival: generators[distType](),
      isSeasonTicket: isSeason,
      processTime: isSeason ? 3 + (Math.random() * 2 - 1) : 6 + (Math.random() * 6 - 3),
      finishTime: null
    });
  }

  // Task 2: Ultras
  if (addUltras) {
    for (let i = 0; i < 500; i++) {
      fans.push({
        id: `ultra-${i}`,
        type: 'ultra',
        arrival: -60 * 60, 
        isSeasonTicket: false,
        processTime: 6 + (Math.random() * 6 - 3),
        finishTime: null
      });
    }
  }

  fans.sort((a, b) => a.arrival - b.arrival);

  const arrivalsPerMinute = new Map();
  fans.forEach(f => {
      const min = Math.floor(f.arrival / 60);
      arrivalsPerMinute.set(min, (arrivalsPerMinute.get(min) || 0) + 1);
  });

  // --- Time Step Loop ---
  let queues = Array.from({ length: numGates }, () => []); 
  let gateFreeAt = Array(numGates).fill(START_TIME); 
  let timelineData = []; 
  
  // Track specific counts
  let stats = { normal: 0, season: 0, ultra: 0, total: 0 };
  
  let currentFanIndex = 0;
  let completedFans = [];

  const numPriorityGates = seasonTicketPriority 
    ? Math.max(1, Math.round(numGates * (seasonTicketPercent / 100))) 
    : 0;

  for (let t = START_TIME; t <= END_TIME; t += 60) {
    // 1. Enqueue new arrivals
    let arrivalsThisStep = [];
    while(currentFanIndex < fans.length && fans[currentFanIndex].arrival <= t) {
      const fan = fans[currentFanIndex];
      arrivalsThisStep.push(fan.type);
      
      let startGate = 0, endGate = numGates;

      if (seasonTicketPriority) {
        if (!fan.isSeasonTicket) startGate = numPriorityGates;
      }

      let bestGate = startGate;
      if (bestGate >= numGates) bestGate = 0; 

      let minLength = queues[bestGate] ? queues[bestGate].length : 999999;
      for(let g = startGate; g < endGate; g++) {
        if (queues[g].length < minLength) {
          bestGate = g;
          minLength = queues[g].length;
        }
      }
      
      queues[bestGate].push(fan);
      currentFanIndex++;
    }

    // 2. Process Gates
    queues.forEach((queue, gateIdx) => {
      while (queue.length > 0) {
        const fan = queue[0];
        const startTime = Math.max(fan.arrival, gateFreeAt[gateIdx]);
        if (startTime > t) break; 

        const finishTime = startTime + fan.processTime;
        if (finishTime > t) break;

        gateFreeAt[gateIdx] = finishTime;
        fan.finishTime = finishTime;
        completedFans.push(fan);
        
        // Update specific counts
        stats.total++;
        stats[fan.type]++;
        
        queue.shift(); 
      }
    });

    // 3. Impatient Fans (Task 5)
    if (impatientFans) {
      const lengths = queues.map(q => q.length);
      const minLen = Math.min(...lengths);
      const maxLen = Math.max(...lengths);
      
      if (maxLen - minLen > 5) {
        const maxIdx = lengths.indexOf(maxLen);
        const minIdx = lengths.indexOf(minLen);
        const canSwitch = !seasonTicketPriority || 
                          (minIdx >= numPriorityGates) || 
                          (minIdx < numPriorityGates && queues[maxIdx][queues[maxIdx].length-1]?.isSeasonTicket);

        if (canSwitch && queues[maxIdx].length > 0) {
           queues[minIdx].push(queues[maxIdx].pop());
        }
      }
    }

    if (t >= START_TIME) {
        timelineData.push({
            time: Math.floor(t / 60),
            arrivals: arrivalsThisStep.length,
            arrivalTypes: arrivalsThisStep, // Store types for visualizer
            inside: stats.total,
            insideStats: { ...stats }, // Snapshot of current breakdown
            queueLength: queues.reduce((acc, q) => acc + q.length, 0),
            gateStats: queues.map(q => q.map(f => f.type)) // Store full queue state (fan types)
        });
    }
  }

  const missedKickoffCount = completedFans.filter(f => f.finishTime > KICKOFF).length;
  const waitTimes = completedFans.map(f => f.finishTime - f.arrival - f.processTime);
  const avgWaitSec = waitTimes.length > 0 ? (waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;
  const lastFinishTime = completedFans.length > 0 ? Math.max(...completedFans.map(f => f.finishTime)) : 0;
  const lastFanMinutesLate = lastFinishTime > KICKOFF ? (lastFinishTime - KICKOFF) / 60 : 0;

  return {
    timelineData,
    stats: {
      totalFans: fans.length,
      insideByKickoff: ((fans.length - missedKickoffCount) / fans.length * 100).toFixed(1),
      missedKickoffCount,
      avgWaitSec: avgWaitSec,
      lastFanMinutesLate: lastFanMinutesLate.toFixed(1)
    }
  };
};


export default runSimulation;
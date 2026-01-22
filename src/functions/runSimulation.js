import generateBeta from './generateBeta';

const runSimulation = (config) => {
  const {
    numGates,
    numSeasonGates,
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
    normal: (type) => {
      if (type==="season"){
        const meanSec = distParams.seasonMean * 60;
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
      }
      const meanSec = distParams.mean * 60;
      const stdDevSec = distParams.stdDev * 60;
      let t, attempts = 0;
      do {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        t = Math.floor(z * stdDevSec + meanSec);
        attempts++;
      } while ((t < START_TIME || t > KICKOFF) && attempts < 50);
      return attempts >= 50
        ? Math.min(KICKOFF, Math.max(START_TIME, t))
        : t;
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

  // --- Fan generation ---
  for (let i = 0; i < actualFans; i++) {
    const isSeason = Math.random() < (seasonTicketPercent / 100);

    let arrivalTime = generators[distType]();

    // ✅ Task 4: season ticket holders arrive later if they have priority
    if (isSeason && seasonTicketPriority) {
      arrivalTime += 15 * 60; // 15 minutes later
      arrivalTime = Math.min(KICKOFF, arrivalTime);
    }

    fans.push({
      id: i,
      type: isSeason ? 'season' : 'normal',
      arrival: generators[distType](isSeason ? 'season' : 'normal'),
      isSeasonTicket: isSeason,
      processTime: isSeason
        ? 3 + (Math.random() * 2 - 1)
        : 6 + (Math.random() * 6 - 3),
      finishTime: null,

      // ✅ Task 5: impatient fan attributes
      isImpatient: Math.random() < 0.3, // 30% impatient
      hasSwitched: false
    });
  }

  // --- Task 2: Ultras ---
  if (addUltras) {
    for (let i = 0; i < 500; i++) {
      fans.push({
        id: `ultra-${i}`,
        type: 'ultra',
        arrival: -60 * 60,
        isSeasonTicket: false,
        processTime: 6 + (Math.random() * 6 - 3),
        finishTime: null,
        isImpatient: false,
        hasSwitched: false
      });
    }
  }

  fans.sort((a, b) => a.arrival - b.arrival);

  // --- Simulation state ---
  let queues = Array.from({ length: numGates }, () => []);
  let gateFreeAt = Array(numGates).fill(START_TIME);
  let timelineData = [];

  let stats = { normal: 0, season: 0, ultra: 0, total: 0, laneChanges: 0, switchedInside: 0 };
  let currentFanIndex = 0;
  let completedFans = [];

  // Ensure numPriorityGates is defined as intended (using your variable)
  const numPriorityGates = numSeasonGates; 

  // --- Time loop ---
  for (let t = START_TIME; t <= END_TIME; t += 60) {
    // 1. Enqueue arrivals
    let arrivalsThisStep = [];
    while (currentFanIndex < fans.length && fans[currentFanIndex].arrival <= t) {
      const fan = fans[currentFanIndex];
      arrivalsThisStep.push(fan.type);
      
      let startGate = 0;
      let endGate = numGates;

      // --- LOGIC CHANGE START ---
      if (seasonTicketPriority && numPriorityGates > 0) {
        if (fan.isSeasonTicket) {
           // Season fans ONLY use priority gates
           startGate = 0;
           endGate = numPriorityGates;
        } else {
           // Normal fans use the remaining gates
           startGate = numPriorityGates;
           endGate = numGates; 
        }
      }
      // --- LOGIC CHANGE END ---

      // (e.g., normal fan but 100% of gates are priority)
      if (startGate >= numGates) startGate = 0;

      let bestGate = startGate;
      
      // Safety check for queue existence
      let minLength = queues[bestGate] ? queues[bestGate].length : 999999;

      // Iterate ONLY through the gates allowed for this specific fan type
      for(let g = startGate; g < endGate; g++) {
        if (queues[g] && queues[g].length < minLength) {
          bestGate = g;
          minLength = queues[g].length;
        }
      }
      
      if (queues[bestGate]) {
        queues[bestGate].push(fan);
      }
      currentFanIndex++;
    }

    // 2. Process gates
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

        stats.total++;
        stats[fan.type]++;
        if (fan.hasSwitched) {
          stats.switchedInside++;
        }

        queue.shift();
      }
    });

    // ✅ Task 5: individual impatient fans switching queues once
    if (impatientFans) {
      queues.forEach((queue, gateIdx) => {
        queue.forEach((fan, idx) => {
          if (!fan.isImpatient || fan.hasSwitched) return;
          if (t - fan.arrival < 10 * 60) return; // waited < 10 min

          const lengths = queues.map(q => q.length);
          const bestGate = lengths.indexOf(Math.min(...lengths));

          if (bestGate !== gateIdx) {
            queues[bestGate].push(fan);
            queue.splice(idx, 1);
            fan.hasSwitched = true;
            stats.laneChanges++;
          }
        });
      });
    }

    timelineData.push({
      time: Math.floor(t / 60),
      arrivals: arrivalsThisStep.length,
      arrivalTypes: arrivalsThisStep,
      inside: stats.total,
      insideStats: { ...stats },
      queueLength: queues.reduce((acc, q) => acc + q.length, 0),
      // Update gateStats to include fan properties needed for visualization
      gateStats: queues.map(q => q.map(f => ({ type: f.type, hasSwitched: f.hasSwitched })))
    });
  }

  // --- Statistics ---
  const missedKickoffCount = completedFans.filter(f => f.finishTime > KICKOFF).length;

  const patientWaits = [];
  const impatientWaits = [];
  const switchedWaits = [];
  const notSwitchedWaits = [];

  completedFans.forEach(f => {
    const wait = f.finishTime - f.arrival - f.processTime;
    if (f.isImpatient) impatientWaits.push(wait);
    else patientWaits.push(wait);

    if (f.hasSwitched) switchedWaits.push(wait);
    else notSwitchedWaits.push(wait);
  });

  const avgPatientWait =
    patientWaits.length > 0
      ? patientWaits.reduce((a, b) => a + b, 0) / patientWaits.length
      : 0;

  const avgImpatientWait =
    impatientWaits.length > 0
      ? impatientWaits.reduce((a, b) => a + b, 0) / impatientWaits.length
      : 0;

  const avgSwitchedWait =
    switchedWaits.length > 0
      ? switchedWaits.reduce((a, b) => a + b, 0) / switchedWaits.length
      : 0;

  const avgNotSwitchedWait =
    notSwitchedWaits.length > 0
      ? notSwitchedWaits.reduce((a, b) => a + b, 0) / notSwitchedWaits.length
      : 0;

  const lastFinishTime =
    completedFans.length > 0
      ? Math.max(...completedFans.map(f => f.finishTime))
      : 0;

  const lastFanMinutesLate =
    lastFinishTime > KICKOFF ? (lastFinishTime - KICKOFF) / 60 : 0;

  const allWaits = [...patientWaits, ...impatientWaits];

  const avgWaitSec =
    allWaits.length > 0
      ? allWaits.reduce((a, b) => a + b, 0) / allWaits.length
      : 0;
  const completedSeason = completedFans.filter(f => f.type === "season");
  const waitTimesSeason = completedSeason.map(f => f.finishTime - f.arrival - f.processTime);
  const avgWaitSecSeason = waitTimesSeason.length > 0 ? (waitTimesSeason.reduce((a, b) => a + b, 0) / waitTimesSeason.length) : 0;

  return {
    timelineData,
    stats: {
      totalFans: fans.length,
      insideByKickoff: ((fans.length - missedKickoffCount) / fans.length * 100).toFixed(1),
      missedKickoffCount,
      avgWaitSec: avgWaitSec.toFixed(1),
      avgPatientWaitSec: avgPatientWait.toFixed(1),
      avgImpatientWaitSec: avgImpatientWait.toFixed(1),
      lastFanMinutesLate: lastFanMinutesLate.toFixed(1),
      totalLaneChanges: stats.laneChanges,
      avgSwitchedWaitSec: avgSwitchedWait.toFixed(1),
      avgNotSwitchedWaitSec: avgNotSwitchedWait.toFixed(1),
      avgWaitSecSeason: avgWaitSecSeason.toFixed(1),
    }
  };
};

export default runSimulation;

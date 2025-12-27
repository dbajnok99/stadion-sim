# 🏟️ Galois-Field Stadium Simulation

A discrete-event simulation application modeling the arrival and entry process of football fans at the "Galois-field" stadium.

**Hosted Live at:** [stadion-sim.dbajnok.hu](https://stadion-sim.dbajnok.hu)

---

## 🎓 Academic Context

This project was created for the lecture **194.076 Modeling and Simulation (VU 2,0) 2025W** at TU Wien.

It addresses the "Football Stadium" simulation problem, where the goal is to optimize gate management and analyze queue dynamics under various constraints and stochastic arrival patterns.

## 🚀 How It Works

The application runs a time-step simulation (t = -120 min to Kickoff) directly in the browser using React. It models individual fans as agents with specific properties (arrival time, ticket type, processing speed) and simulates their interaction with stadium gates.

### Core Simulation Logic

1. **Arrival Generation**: Fans are generated based on statistical distributions (Normal, Uniform, or Beta) to model realistic crowd flows.
2. **Queue Management**: Fans select the shortest eligible gate queue upon arrival.
3. **Processing**: Gates process fans based on ticket type:
   - **Standard Fans**: 6 ± 3 seconds.
   - **Season Ticket Holders**: 3 ± 1 seconds.
4. **Visualization**: The state of the stadium (queues, stands, arrivals) is rendered frame-by-frame on an HTML5 Canvas, synchronized with a timeline chart.

## 🛠️ Features & Tasks

The simulation includes interactive toggles to solve specific tasks from the assignment:

- **Task 1 (Gate Optimization)**: Adjust the number of gates ($n$) to ensure >99% of fans are inside by kickoff.
- **Task 2 (Ultras Arrival)**: Simulates a sudden arrival of 500 away fans (Ultras) exactly 1 hour before kickoff.
- **Task 3 (Overload)**: Tests system resilience by adding 2000 unexpected fans.
- **Task 4 (Priority Lanes)**: Designates specific gates for Season Ticket holders to analyze the impact on average wait times.
- **Task 5 (Impatient Fans)**: Implements "jockeying" behavior where fans switch queues if line lengths are uneven.

# IgnisGuard AI

An intelligent, real-time IoT hazard monitoring and early warning system designed to detect fire risks and hazardous gas leaks.

## Features
- **ESP32 Edge Sensing:** Real-time data collection from MQ-2 gas and IR optical flame sensors.
- **Debounced Signal Processing:** Time-gated sample verification to prevent false triggers from floating pins or transient electrical noise.
- **Machine Learning Threat Analysis:** Decision Tree (CART) classification model running on real-time telemetry to assess hazard severity levels.
- **Interactive Web Dashboard:** Live metric tracking (Gas level, Temperature, Humidity, Flame status, Risk level, Confusion Matrix, and F1 performance metrics).
- **Hardware & Software Alerts:** Dual-action local alerts via hardware LED/Buzzer and web interface visual warnings.

## Tech Stack
- **Hardware:** ESP32 Microcontroller, MQ-2 Gas Sensor, IR Flame Module, Buzzer, LED.
- **Firmware:** C++ / Arduino Framework.
- **Backend & Model:** Node.js / Express API with a trained Decision Tree Machine Learning classifier.
- **Frontend:** React / Vite, Tailwind CSS, Framer Motion, Recharts.

## Repository
https://github.com/angeleliasdsouza-studio/IgnisGuard-AI

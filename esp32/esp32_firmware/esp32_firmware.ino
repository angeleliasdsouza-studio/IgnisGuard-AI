#include <WiFi.h>
#include <HTTPClient.h>

// --- Wi-Fi Credentials ---
const char* ssid     = "Abc";
const char* password = "Abc12345"; 

// --- Laptop API Endpoint ---
const char* serverUrl = "http://10.106.48.143:5000/api/sensor-data";

// --- Correct Pin Assignments ---
#define MQ2_PIN     34    // MQ-2 Gas Sensor Analog Output (D34)
#define FLAME_PIN   14    // Flame Sensor Digital Output (D14)
#define BUZZER_PIN  26    // Buzzer Digital Output (D26)
#define LED_PIN     25    // LED Digital Output (D25)

// --- MQ2 Sensor Settings ---
#define MQ2_WARMUP_MS       180000  // 3 minutes warmup
#define GAS_ALERT_THRESHOLD 2500    // Raw ADC threshold (0-4095)

// --- Flame Debounce Settings ---
#define SAMPLE_INTERVAL_MS  100     // Read flame sensor every 100ms
#define FLAME_CONFIRM_COUNT 30      // 30 samples * 100ms = 3 continuous seconds of fire needed

int flameConfirmCounter = 0;
bool confirmedFlame = false;

unsigned long bootTime = 0;
unsigned long lastSampleTime = 0;
unsigned long lastPostTime = 0;
const unsigned long POST_INTERVAL = 2000; // Send HTTP payload every 2 seconds

void setup() {
  Serial.begin(115200);

  pinMode(MQ2_PIN, INPUT);
  pinMode(FLAME_PIN, INPUT_PULLUP); // Enables internal pull-up on GPIO 14
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  // Default state: Keep OFF
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Hardware Startup Beep Test (1 second)
  delay(500);
  digitalWrite(LED_PIN, HIGH);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(1000); 
  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  // Connect Wi-Fi
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Connected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  bootTime = millis();
  Serial.println("MQ2 warming up... (3 minutes before gas alerts activate)");
}

void loop() {
  unsigned long currentMillis = millis();

  // 1. Time-Gated Flame Sampling (Every 100ms)
  if (currentMillis - lastSampleTime >= SAMPLE_INTERVAL_MS) {
    lastSampleTime = currentMillis;
    
    int flame_raw = digitalRead(FLAME_PIN);

    if (flame_raw == LOW) { // LOW = Fire Detected
      flameConfirmCounter++;
      if (flameConfirmCounter >= FLAME_CONFIRM_COUNT) {
        confirmedFlame = true;
        flameConfirmCounter = FLAME_CONFIRM_COUNT; // Cap counter
      }
    } else {
      // Immediate Reset on HIGH / No Flame
      flameConfirmCounter = 0;
      confirmedFlame = false;
    }
  }

  // 2. Read Gas Sensor & Evaluate Alerts
  int gas_level = analogRead(MQ2_PIN);
  bool mq2_ready = (currentMillis - bootTime) > MQ2_WARMUP_MS;
  bool gas_alert = mq2_ready && (gas_level > GAS_ALERT_THRESHOLD);

  // Output Hardware Alerts
  if (confirmedFlame || gas_alert) {
    digitalWrite(LED_PIN, HIGH);   
    digitalWrite(BUZZER_PIN, HIGH); 
  } else {
    digitalWrite(LED_PIN, LOW);    
    digitalWrite(BUZZER_PIN, LOW);  
  }

  // 3. HTTP Post Routine (Every 2000ms)
  if (currentMillis - lastPostTime >= POST_INTERVAL) {
    lastPostTime = currentMillis;

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;

      // Static placeholders for Dashboard compatibility
      float temperature = 32.5;
      float humidity = 58.0;

      int flame_raw = digitalRead(FLAME_PIN);
      Serial.printf("[SENSORS] Gas: %d | Flame Raw: %s | Confirmed: %s | Counter: %d/%d | MQ2 Warmed Up: %s\n",
        gas_level,
        flame_raw == LOW ? "DETECTED!" : "None",
        confirmedFlame ? "YES" : "NO",
        flameConfirmCounter,
        FLAME_CONFIRM_COUNT,
        mq2_ready ? "YES" : "NO (warming up...)"
      );

      String jsonPayload = "{";
      jsonPayload += "\"gas_level\":" + String(gas_level) + ",";
      jsonPayload += "\"temperature\":" + String(temperature, 1) + ",";
      jsonPayload += "\"humidity\":" + String(humidity, 1) + ",";
      jsonPayload += "\"flame_status\":" + String(confirmedFlame ? 1 : 0);
      jsonPayload += "}";

      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      int httpResponseCode = http.POST(jsonPayload);

      if (httpResponseCode > 0) {
        Serial.printf("Data posted! Response code: %d\n", httpResponseCode);
      } else {
        Serial.printf("HTTP Post Error: %s\n", http.errorToString(httpResponseCode).c_str());
      }

      http.end();
    } else {
      Serial.println("Wi-Fi Connection Lost!");
    }
  }
}
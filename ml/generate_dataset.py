"""
AI Fire & Gas Monitor — Dataset Generator
Generates a realistic training dataset for the Decision Tree Classifier.
Classes: Normal, Gas Warning, Fire Risk, Critical
Features: gas_level, temperature, humidity, flame_status, gas_change, temperature_change
"""

import csv
import random
import os
import math

random.seed(42)

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'sensor_data.csv')

def generate_dataset(num_samples=2000):
    """Generate realistic labeled sensor data for training."""
    rows = []

    class_counts = {
        'Normal':      int(num_samples * 0.40),
        'Gas Warning': int(num_samples * 0.25),
        'Fire Risk':   int(num_samples * 0.20),
        'Critical':    int(num_samples * 0.15),
    }

    def clamp(val, lo, hi):
        return max(lo, min(hi, val))

    def noisy(val, noise=0.05):
        return val * (1 + random.uniform(-noise, noise))

    for label, count in class_counts.items():
        prev_gas = None
        prev_temp = None

        for _ in range(count):
            if label == 'Normal':
                gas   = clamp(noisy(random.uniform(150, 350), 0.1), 100, 400)
                temp  = clamp(noisy(random.uniform(25, 33), 0.08), 20, 36)
                hum   = clamp(noisy(random.uniform(50, 75), 0.07), 40, 85)
                flame = 0
                risk  = random.uniform(0, 15)

            elif label == 'Gas Warning':
                gas   = clamp(noisy(random.uniform(400, 680), 0.1), 350, 720)
                temp  = clamp(noisy(random.uniform(28, 38), 0.08), 25, 42)
                hum   = clamp(noisy(random.uniform(45, 68), 0.07), 35, 75)
                flame = 0
                risk  = random.uniform(30, 60)

            elif label == 'Fire Risk':
                gas   = clamp(noisy(random.uniform(580, 800), 0.08), 500, 850)
                temp  = clamp(noisy(random.uniform(40, 65), 0.08), 35, 75)
                hum   = clamp(noisy(random.uniform(30, 55), 0.07), 20, 60)
                flame = random.choices([0, 1], weights=[20, 80])[0]
                risk  = random.uniform(65, 90)

            elif label == 'Critical':
                gas   = clamp(noisy(random.uniform(780, 1000), 0.07), 700, 1023)
                temp  = clamp(noisy(random.uniform(65, 95), 0.07), 55, 100)
                hum   = clamp(noisy(random.uniform(15, 38), 0.07), 10, 45)
                flame = 1
                risk  = random.uniform(88, 100)

            # Compute change features (realistic temporal delta)
            gas_change  = round((gas - prev_gas) if prev_gas is not None else random.uniform(-5, 5), 2)
            temp_change = round((temp - prev_temp) if prev_temp is not None else random.uniform(-0.2, 0.2), 2)

            prev_gas  = gas
            prev_temp = temp

            rows.append({
                'gas_level':         round(gas, 2),
                'temperature':       round(temp, 2),
                'humidity':          round(hum, 2),
                'flame_status':      flame,
                'gas_change':        gas_change,
                'temperature_change':temp_change,
                'risk_score':        round(risk, 2),
                'label':             label
            })

    # Shuffle dataset
    random.shuffle(rows)
    return rows


def save_dataset(rows):
    os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)
    fieldnames = ['gas_level', 'temperature', 'humidity', 'flame_status',
                  'gas_change', 'temperature_change', 'risk_score', 'label']
    with open(DATASET_PATH, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"✅ Dataset saved: {DATASET_PATH}")
    print(f"   Total samples: {len(rows)}")


if __name__ == '__main__':
    rows = generate_dataset(2000)
    save_dataset(rows)

    # Show class distribution
    from collections import Counter
    labels = [r['label'] for r in rows]
    dist = Counter(labels)
    print("\nClass Distribution:")
    for cls, cnt in dist.items():
        print(f"  {cls:<15}: {cnt} ({cnt/len(rows)*100:.1f}%)")

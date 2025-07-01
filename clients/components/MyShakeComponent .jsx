import React, { useEffect, useState } from 'react';
import { DeviceMotion } from 'expo-sensors';
import { SendEmergencyAlert } from './Emergency';

export default function ShakeDetector() {
  const [lastShake, setLastShake] = useState(Date.now());

  useEffect(() => {
    const subscription = DeviceMotion.addListener(({ accelerationIncludingGravity }) => {
      const { x = 0, y = 0, z = 0 } = accelerationIncludingGravity ?? {};
      const totalForce = Math.abs(x) + Math.abs(y) + Math.abs(z);

      if (totalForce > 30) {
        const now = Date.now();
        if (now - lastShake > 2000) {
          setLastShake(now);
          console.log('Shake detected!');
          SendEmergencyAlert(); // ✅ call the function, don't render it
        }
      }
    });

    DeviceMotion.setUpdateInterval(300);

    return () => subscription.remove();
  }, [lastShake]);

  return null; // no need to return a UI element
}

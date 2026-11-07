import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export async function playHaptic(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy })
    } catch (error) {
      console.error('Unable to trigger native haptic feedback.', error)
    }
    return
  }

  if (typeof navigator !== 'undefined') navigator.vibrate?.([55, 30, 55])
}

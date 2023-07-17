import { useRoute } from 'vue-router'

import type { TrackingValue } from '@/types/tracking'

export const useTracking = () => { return useRoute().meta.tracking as TrackingValue[] }
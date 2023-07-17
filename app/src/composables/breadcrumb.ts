import { useRoute } from 'vue-router'

import type { BreadcrumbValue } from '@/types/breadcrumb'

export const useBreadcrumb = () => { return useRoute().meta.breadcrumb as BreadcrumbValue[] }
import { onBeforeUnmount } from 'vue'
import type { StoreGeneric } from 'pinia'

import type { Item } from '@/types/item'
import { mercureSubscribe } from '@/utils/mercure'

export function useMercureList({ store, deleteStore }: { store: StoreGeneric, deleteStore: StoreGeneric }) {
	const mercureEl = <T extends Item>(data: T) => {
		if (Object.keys(data).length === 1) {
			store.deleteItem(data)
			return deleteStore.setMercureDeleted(data)
		}

		store.updateItem(data)
	}

	let mercureSub: EventSource | null = null

	store.$subscribe((mutation: any, state: any) => {
		if (!state.hubUrl) return
		if (mercureSub) mercureSub.close()
		if (!state.items?.length) return

		mercureSub = mercureSubscribe(state.hubUrl, state.items.map((i: any) => i['@id'] ?? ''), mercureEl)
	})

	onBeforeUnmount(() => mercureSub?.close())
}
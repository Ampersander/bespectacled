import type { Item } from './item'
import type { Event } from './event'

export interface Schedule extends Item {
	date: string
	times: string[]
	event: Event
}
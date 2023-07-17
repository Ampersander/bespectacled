import type { Item } from './item'
import type { User } from './user'
import type { Venue } from './venue'
import type { Schedule } from './schedule'

export interface Event<T = true> extends Item {
	slug: string
	title: string
	type: string
	price: number
	description: string
	src?: string
	venue?: T extends true ? Venue : string
	artists: T extends true ? User[] : string[]
	schedules: T extends true ? Schedule[] : string[]
}
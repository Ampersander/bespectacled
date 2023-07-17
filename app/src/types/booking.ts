import type { Item } from './item'
import type { User } from './user'
import type { Venue } from './venue'
import type { Transaction } from './transaction'

export interface Booking extends Item {
	date: Date
	venue: Venue
	client: User
	status: number
	lastModified: Date
	transaction: Transaction
}
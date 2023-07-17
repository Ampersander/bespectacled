import type { Item } from './item'
import type { User } from './user'
import type { Venue } from './venue'
import type { Transaction } from './transaction'

export interface Booking extends Item {
	status: number
	createdAt: string
	updatedAt: string
	venue: Venue
	user: User
	transaction: Transaction
}
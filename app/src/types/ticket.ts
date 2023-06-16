import type { Item } from './item'
import type { User } from './user'
import type { Event } from './event'
import type { Transaction } from './transaction'

export interface Ticket extends Item {
	reference: string
	status: number
	buyer: User
	event: Event
	transaction: Transaction
}
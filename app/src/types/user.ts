import type { Item } from './item'
import type { Event } from './event'
import type { Ticket } from './ticket'
import type { Booking } from './booking'
import type { Transaction } from './transaction'

export interface User extends Item {
	token?: string
	username: string
	email: string
	roles: string[]
	enabled: boolean
	createdAt: string
	updatedAt: string
	events: Event[]
	tickets: Ticket[]
	bookings: Booking[]
	transactions: Transaction[]
}
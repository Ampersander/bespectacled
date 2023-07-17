import type { Item } from './item'
import type { User } from './user'
import type { Ticket } from './ticket'
import type { Booking } from './booking'

export interface Transaction extends Item {
	amount: number
	status: number
	createdAt: string
	updatedAt: string
	buyer: User
	tickets: Ticket[]
	bookings: Booking[]
}
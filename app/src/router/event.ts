const names = {
	list: 'EventList',
	show: 'EventShow',
	create: 'EventCreate',
	update: 'EventUpdate'
}

const breadcrumbs = {
	list: { title: names.list, to: { name: names.list } },
	show: { title: names.show, to: { name: names.show } },
	create: { title: names.create, to: { name: names.create } },
	update: { title: names.update, to: { name: names.update } }
}

export default [
	{
		name: names.list,
		path: 'events',
		component: () => import('@/views/event/ViewList.vue'),
		meta: { breadcrumb: [breadcrumbs.list] }
	},
	{
		name: names.show,
		path: 'events/show/:id',
		component: () => import('@/views/event/ViewShow.vue'),
		meta: { breadcrumb: [breadcrumbs.list, breadcrumbs.show] }
	},
	{
		name: names.create,
		path: 'events/create',
		component: () => import('@/views/event/ViewCreate.vue'),
		meta: { breadcrumb: [breadcrumbs.list, breadcrumbs.create] }
	},
	{
		name: names.update,
		path: 'events/edit/:id',
		component: () => import('@/views/event/ViewUpdate.vue'),
		meta: { breadcrumb: [breadcrumbs.list, breadcrumbs.update] }
	}
]
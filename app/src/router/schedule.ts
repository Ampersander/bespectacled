const names = {
	list: 'ScheduleList',
	show: 'ScheduleShow',
	create: 'ScheduleCreate',
	update: 'ScheduleUpdate'
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
		path: 'schedules',
		component: () => import('@/views/schedule/ViewList.vue'),
		meta: { breadcrumb: [breadcrumbs.list] }
	},
	{
		name: names.show,
		path: 'schedules/show/:id',
		component: () => import('@/views/schedule/ViewShow.vue'),
		meta: { breadcrumb: [breadcrumbs.list, breadcrumbs.show] }
	},
	{
		name: names.create,
		path: 'schedules/create',
		component: () => import('@/views/schedule/ViewCreate.vue'),
		meta: { breadcrumb: [breadcrumbs.list, breadcrumbs.create] }
	},
	{
		name: names.update,
		path: 'schedules/edit/:id',
		component: () => import('@/views/schedule/ViewUpdate.vue'),
		meta: { breadcrumb: [breadcrumbs.list, breadcrumbs.update] }
	}
]
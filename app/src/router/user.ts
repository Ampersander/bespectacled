const names = {
	list: 'UserList',
	show: 'UserShow',
	create: 'UserCreate',
	update: 'UserUpdate'
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
		path: 'users',
		component: () => import('@/views/user/ViewList.vue'),
		meta: { breadcrumb: [breadcrumbs.list] }
	},
	{
		name: names.show,
		path: 'users/show/:id',
		component: () => import('@/views/user/ViewShow.vue'),
		meta: { breadcrumb: [breadcrumbs.list, breadcrumbs.show] }
	},
	{
		name: names.create,
		path: 'users/create',
		component: () => import('@/views/user/ViewCreate.vue'),
		meta: { breadcrumb: [breadcrumbs.list, breadcrumbs.create] }
	},
	{
		name: names.update,
		path: 'users/edit/:id',
		component: () => import('@/views/user/ViewUpdate.vue'),
		meta: { breadcrumb: [breadcrumbs.list, breadcrumbs.update] }
	}
]
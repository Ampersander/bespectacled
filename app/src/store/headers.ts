export default function headers(data = null) {
	const user = data || JSON.parse(localStorage.getItem('user') || 'null')
	if (user && user?.token) return { Authorization: 'Bearer ' + user.token }
	else return { Authorization: '' }
}
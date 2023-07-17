import axios from 'axios'

import { ENTRYPOINT } from './config'

export default axios.create({
	baseURL: ENTRYPOINT,
	headers: {
		'Content-Type': 'application/json'
	}
})
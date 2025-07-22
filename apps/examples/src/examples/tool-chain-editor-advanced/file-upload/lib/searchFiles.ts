import { supabase } from './supabaseClient'

export async function searchUserFiles(query: string, userId: string | null) {
	const { data, error } = await supabase
		.from('files')
		.select('*')
		.ilike('file_name', `%${query}%`)
		.eq('user_id', userId) // null for anon user
		.order('created_at', { ascending: false })

	if (error) throw error
	return data
}

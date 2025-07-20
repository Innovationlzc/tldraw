import { supabase } from '../lib/supabaseClient'

export function useGlobalFileUploadToStorage(userId: string) {

//   if (!userId) {
// 	console.log('hellooooooooo')
//   }
  const uploadFile = async (
    file: File,
    options?: { description?: string; tags?: string[] }
  ) => {
    const timestamp = Date.now()
    const path = `uploads/${file.name}-${timestamp}`

    const { error: uploadError } = await supabase.storage
      .from('user-files')
      .upload(path, file)
    if (uploadError) throw uploadError


	// if (!userId) {
	// console.warn('Anonymous upload detected — skipping DB write.')
	// return
	// }
	// console.log('File uploaded to storage:', path)

    // const version = await getNextVersion(file.name, userId)

	const safeUserId = userId || null
    const { error: dbError } = await supabase.from('files').insert({
      user_id: safeUserId,
      file_name: file.name,
      storage_url: path,
      created_at: new Date().toISOString(),
      mime_type: file.type,
      size: file.size,
	  version: 1, // for anon users, just assume v1
      is_latest: true,
      tags: options?.tags || [],
      description: options?.description || '',
    })

    if (dbError) throw dbError
	console.log('File uploaded to storage:', path)
	console.log('File metadata saved to database:', {
	  user_id: safeUserId,
	  file_name: file.name,
	  storage_url: path,
	  created_at: new Date().toISOString(),
	  mime_type: file.type,
	  size: file.size,
	  version: 1, // for anon users, just assume v1
	  is_latest: true,
	  tags: options?.tags || [],
	  description: options?.description || '',
	})

    // Mark older versions as not latest
    // await supabase
    //   .from('files')
    //   .update({ is_latest: false })
    //   .eq('user_id', userId)
    //   .eq('file_name', file.name)
    //   .neq('storage_url', path)
  }

//   const getNextVersion = async (fileName: string, userId: string) => {
//     const { data } = await supabase
//       .from('files')
//       .select('version')
//       .eq('file_name', fileName)
//       .eq('user_id', userId)
//       .order('version', { ascending: false })
//       .limit(1)

//     return data?.[0]?.version + 1 || 1
//   }

  return { uploadFile }
}

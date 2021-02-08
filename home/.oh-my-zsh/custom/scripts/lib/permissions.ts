type PermissionDescriptors = Deno.PermissionDescriptor['name']
interface Request { justification: string, options?: Record<string, string> }
export default async function request({ justification, options }: Request, ...perms: PermissionDescriptors[]) {
  options = options || {}
  const permissionQueries = perms.map(perm => ({name: perm, ...options})).map(Deno.permissions.query)
  const permsAreAlreadyGranted = await Promise.all(permissionQueries).then(perms => {
    return perms.every(perm => perm.state === 'granted')
  })
  if (!permsAreAlreadyGranted) console.log(justification)
  const permissionRequests = perms.map(perm => ({name: perm, ...options})).map(Deno.permissions.request)
  const permissionStatuses = await Promise.all(permissionRequests)
  if (!permissionStatuses.every(status => status.state === 'granted')) {
    Deno.exit(1)
  }
}

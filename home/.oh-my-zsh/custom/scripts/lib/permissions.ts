type PermissionDescriptors = Deno.PermissionDescriptor['name']
export default async function request({ justification }: { justification: string }, ...perms: PermissionDescriptors[]) {
  const permissionQueries = perms.map(perm => ({name: perm})).map(Deno.permissions.query)
  const permsAreAlreadyGranted = await Promise.all(permissionQueries).then(perms => {
    return perms.every(perm => perm.state === 'granted')
  })
  if (!permsAreAlreadyGranted) console.log(justification)
  const permissionRequests = perms.map(perm => ({name: perm})).map(Deno.permissions.request)
  const permissionStatuses = await Promise.all(permissionRequests)
  if (!permissionStatuses.every(status => status.state === 'granted')) {
    Deno.exit(1)
  }
}

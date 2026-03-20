export type NavItem = {
  label: string
  path: string
}

export type ModuleStatus = 'done' | 'active' | 'locked'

export type SidebarModule = {
  id: string
  label: string
  status: ModuleStatus
}
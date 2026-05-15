export interface WorkPermitTableItem {
  id: string
  otNumber: string
  company: string
  area: string
  type: string
  status: string
  date: string
  workCompleted: boolean
}

export interface WorkPermitUpdateData {
  id: string
  workCompleted: boolean
}

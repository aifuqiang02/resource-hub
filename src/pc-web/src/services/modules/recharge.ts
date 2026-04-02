import { httpClient } from '@/services/http/client'

export interface CreateSessionResponse {
  bizId: string
  qrCodeUrl: string
  pollUrl: string
}

export interface PaymentSession {
  sessionId: string
  bizId: string
  status: 'pending' | 'paid' | 'expired' | 'closed'
  amount: number
  paidAt: string | null
  paymentProduct: {
    id: string
    name: string
    price: number
  }
}

export const rechargeService = {
  async createSession(points: number): Promise<CreateSessionResponse> {
    const response = await httpClient.post<{ code: number; data: CreateSessionResponse; msg: string }>('/recharge/create', { points })
    return response.data
  },

  async pollStatus(bizId: string): Promise<PaymentSession> {
    const response = await httpClient.get<{ code: number; data: PaymentSession; msg: string }>(`/recharge/status/${bizId}`)
    return response.data
  },

  async getRecharges() {
    return httpClient.get('/recharge/list')
  },
}

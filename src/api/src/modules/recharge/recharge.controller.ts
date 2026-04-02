import type { Request, Response } from 'express'

import { sendSuccess } from '../../lib/http-response'

import {
  createPaymentSession,
  pollPaymentStatus,
  handlePaymentNotify,
  getUserRecharges,
  settleRechargeFromSession,
} from './recharge.service'

export async function createSession(req: Request, res: Response) {
  const userId = req.auth!.userId
  const { points } = req.body

  const result = await createPaymentSession(userId, points)

  return sendSuccess(res, {
    data: result,
  })
}

export async function pollStatus(req: Request, res: Response) {
  const bizId = String(req.params.bizId)

  const session = await pollPaymentStatus(bizId)
  await settleRechargeFromSession(session)

  return sendSuccess(res, {
    data: session,
  })
}

export async function notify(req: Request, res: Response) {
  const bizId = String(req.body?.bizId || '')

  if (!bizId) {
    return sendSuccess(res, {
      data: { success: false },
      msg: 'missing bizId',
    })
  }

  await handlePaymentNotify(bizId)

  return sendSuccess(res, {
    data: { success: true },
  })
}

export async function listUserRecharges(req: Request, res: Response) {
  const userId = req.auth!.userId

  const recharges = await getUserRecharges(userId)

  return sendSuccess(res, {
    data: recharges,
  })
}

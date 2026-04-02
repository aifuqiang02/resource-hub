import { randomUUID } from 'crypto'

import axios from 'axios'
import { z } from 'zod'

import { env } from '../../config/env'
import { AppError } from '../../lib/app-error'
import { prisma } from '../../lib/prisma'

const paymentProductIds: Record<number, string> = {
  10: 'cmnchwddv00c35cdwun55u45i',
  50: 'cmnchwpx900c55cdwy88cf9u3',
  100: 'cmnchwxi700c75cdwtf24eb82',
  200: 'cmnchx64m00c95cdw7zvdu3ao',
}

const AMOUNT_MAP: Record<string, number> = {
  cmnchwddv00c35cdwun55u45i: 1,
  cmnchwpx900c55cdwy88cf9u3: 5,
  cmnchwxi700c75cdwtf24eb82: 10,
  cmnchx64m00c95cdw7zvdu3ao: 20,
}

const openPlatformAppBaseUrl = `${env.OPEN_PLATFORM_BASE_URL.replace(/\/$/, '')}/api/v1/apps/${env.OPEN_PLATFORM_APP_ID}`

const createSessionSchema = z.object({
  points: z.number().int().positive(),
})

export interface CreateSessionResponse {
  bizId: string
  qrCodeUrl: string
  pollUrl: string
}

export async function createPaymentSession(
  userId: string,
  points: number,
): Promise<CreateSessionResponse> {
  const parsed = createSessionSchema.parse({ points })

  const paymentProductId = paymentProductIds[parsed.points]
  if (!paymentProductId) {
    throw new AppError('无效的充值套餐', 400)
  }

  const bizId = randomUUID()

  const notifyUrl = `${env.PAYMENT_NOTIFY_URL}/api/v1/recharge/notify`

  let recharge
  try {
    recharge = await prisma.pointsRecharge.create({
      data: {
        userId,
        bizId,
        points: parsed.points,
        amount: AMOUNT_MAP[paymentProductId],
        paymentMethod: 'WECHAT',
        status: 'PENDING',
      },
    })

    const response = await axios.post(
      `${openPlatformAppBaseUrl}/payment/sessions`,
      {
        paymentProductId,
        bizId: recharge.bizId,
        notifyUrl,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('Payment platform response:', JSON.stringify(response.data))

    if (response.data.code !== 200) {
      throw new AppError(response.data.msg || '创建支付会话失败', 500)
    }

    if (!response.data.data) {
      throw new AppError('支付平台返回数据为空', 500)
    }

    return {
      bizId: recharge.bizId,
      qrCodeUrl: response.data.data.qrCodeUrl,
      pollUrl: `${openPlatformAppBaseUrl}/payment/sessions/by-biz/${recharge.bizId}`,
    }
  } catch (error) {
    console.error('Payment session error:', error)
    if (recharge?.id) {
      await prisma.pointsRecharge.delete({ where: { id: recharge.id } }).catch(console.error)
    }
    throw error
  }
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

export async function pollPaymentStatus(bizId: string): Promise<PaymentSession> {
  const response = await axios.get<{
    code: number
    data: PaymentSession
    msg?: string
  }>(
    `${openPlatformAppBaseUrl}/payment/sessions/by-biz/${bizId}`,
  )

  if (response.data.code !== 200) {
    throw new AppError(response.data.msg || '查询支付状态失败', 500)
  }

  return response.data.data
}

export async function settleRechargeFromSession(
  session: PaymentSession,
): Promise<void> {
  if (session.status !== 'paid') {
    return
  }

  await settlePaidRecharge(session.bizId, session.paidAt)
}

export async function handlePaymentNotify(
  bizId: string,
): Promise<void> {
  const session = await pollPaymentStatus(bizId)

  await settleRechargeFromSession(session)
}

async function settlePaidRecharge(
  bizId: string,
  paidAt: string | null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const recharge = await tx.pointsRecharge.findUnique({
      where: { bizId },
    })

    if (!recharge) {
      throw new AppError('充值记录不存在', 404)
    }

    const markPaidResult = await tx.pointsRecharge.updateMany({
      where: {
        id: recharge.id,
        status: {
          not: 'PAID',
        },
      },
      data: {
        status: 'PAID',
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      },
    })

    if (markPaidResult.count === 0) {
      return
    }

    const user = await tx.user.findUnique({
      where: { id: recharge.userId },
      select: { pointsBalance: true },
    })

    if (!user) {
      throw new AppError('用户不存在', 404)
    }

    const balanceBefore = user.pointsBalance
    const balanceAfter = balanceBefore + recharge.points

    await tx.user.update({
      where: { id: recharge.userId },
      data: {
        pointsBalance: balanceAfter,
      },
    })

    await tx.pointsTransaction.create({
      data: {
        userId: recharge.userId,
        type: 'RECHARGE',
        delta: recharge.points,
        balanceBefore,
        balanceAfter,
        referenceType: 'RECHARGE',
        referenceId: recharge.id,
      },
    })
  })
}

export async function getUserRecharges(userId: string) {
  return prisma.pointsRecharge.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

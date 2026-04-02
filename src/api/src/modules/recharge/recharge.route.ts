import { Router } from 'express'

import { requireAuth } from '../../middlewares/auth'

import {
  createSession,
  pollStatus,
  notify,
  listUserRecharges,
} from './recharge.controller'

export const rechargeRouter = Router()

rechargeRouter.post('/create', requireAuth(), createSession)
rechargeRouter.get('/status/:bizId', pollStatus)
rechargeRouter.post('/notify', notify)
rechargeRouter.get('/list', requireAuth(), listUserRecharges)

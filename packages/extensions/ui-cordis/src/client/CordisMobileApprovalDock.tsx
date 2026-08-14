/** Compact, in-flow approval surface for Cordis packages on phone layouts. */

import { useState } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { CordisPanelFace } from './slots.ts'
import css from './CordisMobileApprovalDock.module.css'

export type CordisMobileApprovalDockProps =
  PropsRuntime<'conversation.input.dock'> & InjectFace<CordisPanelFace> & PropsLocale<'cordis'>

export function CordisMobileApprovalDock({
  session, useActiveRuns, onApprove, onDecline, t,
}: CordisMobileApprovalDockProps) {
  const activities = useActiveRuns(snapshot => snapshot)
  const request = [...activities.entries()].find(([, activity]) =>
    activity.phase === 'awaiting-approval' && activity.agentId === session.sessionId)
  const [busy, setBusy] = useState(false)

  if (request === undefined || request[1].phase !== 'awaiting-approval') return null
  const [pluginId, activity] = request
  const answer = async (approve: boolean, future = false): Promise<void> => {
    if (busy) return
    setBusy(true)
    try {
      if (approve) await onApprove(activity.requestId, future)
      else await onDecline(activity.requestId)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={css.root} data-cordis-mobile-approval={activity.requestId} aria-label={t('panel.title')}>
      <div className={css.copy}>
        <strong>{activity.name || String(pluginId)}</strong>
        <span>{activity.purpose || t('status.awaitingApproval')}</span>
      </div>
      <div className={css.actions}>
        <button type="button" disabled={busy} onClick={() => { void answer(false) }}>{t('action.decline')}</button>
        <button type="button" disabled={busy} onClick={() => { void answer(true, false) }}>{t('action.approveOnce')}</button>
        <button className={css.primary} type="button" disabled={busy} onClick={() => { void answer(true, true) }}>
          {t('action.approvePlugin')}
        </button>
      </div>
    </section>
  )
}

import type { Location } from 'history'
import { Route, Routes, useLocation } from 'react-router'
import { MobilePageNotFound } from './components'
import { FeatureFlags, useFeatureManager } from './FeatureManager'
import { MobileAccountSummaryContainer } from './modules/account-views-mobile'
import { BackupCodesPageContainer } from './modules/backup-codes/BackupCodesPageContainer'
import { DemandAlertsPage } from './modules/demand-alerts-views'
import { DemandMonitorPageContainer } from './modules/demand-monitor-views'
import { MobileEarningSummaryContainer } from './modules/earn-views-mobile'
import { OldMobileEarningSummaryContainer } from './modules/earn-views-mobile/OldMobileEarningSummaryContainer'
import { PasskeyDeletePageContainer } from './modules/passkey-delete'
import { ProtectedActionPageContainer } from './modules/protected-action'
import { RewardDetailsContainer } from './modules/reward-views'

export const MobileRoutes = () => {
  const location = useLocation()
  const featureManager = useFeatureManager()
  const isDemandMonitorFeatureFlagEnabled = featureManager.isEnabled(FeatureFlags.DemandMonitor)
  const isDemandNotificationsFeatureFlagEnabled = featureManager.isEnabled(FeatureFlags.DemandNotifications)
  const isFleetDashboardFeatureFlagEnabled = featureManager.isEnabled(FeatureFlags.FleetDashboard)
  const currentLocation =
    (location.state as { currentLocation: Location | undefined } | undefined)?.currentLocation || location
  return (
    <>
      <Routes location={currentLocation}>
        <Route
          path="/earn/summary"
          element={
            isFleetDashboardFeatureFlagEnabled ? (
              <MobileEarningSummaryContainer />
            ) : (
              <OldMobileEarningSummaryContainer />
            )
          }
        />
        {isDemandMonitorFeatureFlagEnabled && <Route path="/earn/demand" element={<DemandMonitorPageContainer />} />}
        {isDemandNotificationsFeatureFlagEnabled && <Route path="/account/alerts" element={<DemandAlertsPage />} />}
        <Route path="/account/summary" element={<MobileAccountSummaryContainer />} />
        <Route path="/rewards/:id" element={<RewardDetailsContainer />} />
        <Route path="/account/passkey/delete/:id" element={<PasskeyDeletePageContainer />} />
        <Route path="/account/backup-codes" element={<BackupCodesPageContainer />} />
        <Route path="/protected-action" element={<ProtectedActionPageContainer />} />
        <Route path="*" element={<MobilePageNotFound />} />
      </Routes>
    </>
  )
}

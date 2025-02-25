import { Navigate, Route, Routes, useLocation } from 'react-router'
import { NoPageFound } from './components'
import { FeatureFlags, useFeatureManager } from './FeatureManager'
import { BackupCodesPageContainer } from './modules/backup-codes/BackupCodesPageContainer'
import { ReplaceBonusModalContainer } from './modules/bonus-views'
import { DemandMonitorPageContainer } from './modules/demand-monitor-views/DemandMonitorPage'
import { EarnInfoPage, EarningSummaryContainer } from './modules/earn-views'
import { OldEarningSummaryContainer } from './modules/earn-views/OldEarningSummaryContainer'
import { ExitSurveyContainer } from './modules/exit-survey-views'
import { PasskeyDeletePageContainer } from './modules/passkey-delete'
import { ProtectedActionPageContainer } from './modules/protected-action'
import { RewardDetailsContainer, SelectTargetRewardContainer } from './modules/reward-views'
import { SaladPayOrderSummaryContainer } from './modules/salad-pay-views'
import { SettingsContainer } from './modules/settings-views'
import { StorefrontHomePage } from './modules/storefront-views/pages/StorefrontHomePage'
import { VaultListContainer } from './modules/vault-views'

interface Props {
  isAuthenticated: boolean
}

export const RoutesComponent = ({ isAuthenticated }: Props) => {
  const location = useLocation()
  const featureManager = useFeatureManager()
  const isDemandMonitorFeatureFlagEnabled = featureManager.isEnabled(FeatureFlags.DemandMonitor)
  const isFleetDashboardFeatureFlagEnabled = featureManager.isEnabled(FeatureFlags.FleetDashboard)

  const currentLocation =
    (location.state as { currentLocation?: typeof location } | undefined)?.currentLocation || location

  return (
    <Routes location={currentLocation}>
      {/* Store Pages */}
      <Route path="/store" element={<StorefrontHomePage />} />
      <Route path="/store/search" element={<StorefrontHomePage />} />
      <Route path="/store/rewards/:id" element={<RewardDetailsContainer />} />
      <Route path="/store/vault" element={<VaultListContainer />} />
      <Route path="/store/select-target-reward" element={<SelectTargetRewardContainer />} />

      {/* Modals */}
      <Route path="/salad-pay/order-summary" element={<SaladPayOrderSummaryContainer />} />
      <Route path="/bonuses/replace-bonus" element={<ReplaceBonusModalContainer />} />

      {/* Account Routes (nested) */}
      <Route path="/account">
        {/* When exactly at /account, redirect to /account/summary */}
        <Route index element={<Navigate to="/account/summary" replace />} />
        <Route path="exit-survey" element={<ExitSurveyContainer />} />
        <Route path="passkey/delete/:id" element={<PasskeyDeletePageContainer />} />
        <Route path="backup-codes" element={<BackupCodesPageContainer />} />
        {/* Fallback: all other /account paths */}
        <Route path="*" element={<SettingsContainer />} />
      </Route>

      {/* Protected Action */}
      <Route path="/protected-action" element={<ProtectedActionPageContainer />} />

      {/* Earn Routes (nested) */}
      <Route path="/earn">
        {isAuthenticated && <Route index element={<Navigate to="/earn/summary" replace />} />}
        <Route
          path="summary"
          element={isFleetDashboardFeatureFlagEnabled ? <EarningSummaryContainer /> : <OldEarningSummaryContainer />}
        />
        {isDemandMonitorFeatureFlagEnabled && <Route path="demand" element={<DemandMonitorPageContainer />} />}
        {/* Fallback for any other /earn path */}
        <Route path="*" element={<EarnInfoPage />} />
      </Route>

      {/* Search Redirect */}
      <Route path="/search" element={<Navigate to={`/store${location.pathname}`} replace />} />

      {/* Rewards Redirect */}
      <Route path="/rewards/:id" element={<Navigate to="/store/rewards/:id" replace />} />

      {/* Root Redirect */}
      <Route path="/" element={<Navigate to="/store" replace />} />

      {/* Fallback for any unmatched route */}
      <Route path="*" element={<NoPageFound />} />
    </Routes>
  )
}

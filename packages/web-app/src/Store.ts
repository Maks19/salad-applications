import { AxiosInstance } from 'axios'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { action, autorun, configure, flow, observable } from 'mobx'
import { RouterStore } from 'mobx-react-router'
import { FeatureManager } from './FeatureManager'
import { AnalyticsStore } from './modules/analytics'
import { AuthStore } from './modules/auth'
import { BalanceStore } from './modules/balance'
import { BonusStore } from './modules/bonus'
import { RefreshService } from './modules/data-refresh'
import { EngagementStore } from './modules/engagement'
import { HelpScoutStore } from './modules/helpscout/HelpScoutStore'
import { HomeStore } from './modules/home/HomeStore'
import {
  AutoStartStore,
  DetectedHardwareUIStore,
  MachineSettingsUIStore,
  MachineStore,
  NativeStore
} from './modules/machine'
import { ActiveWorkloadsUIStore } from './modules/machine/ActiveWorkloadsUIStore'
import { NotificationStore } from './modules/notifications'
import { OnboardingAntivirusStore, OnboardingAutoStartStore, OnboardingStore } from './modules/onboarding'
import { ProfileStore } from './modules/profile'
import { Profile } from './modules/profile/models'
import { ReferralStore } from './modules/referral'
import { RewardStore } from './modules/reward'
import { SaladBowlStore } from './modules/salad-bowl'
import { StopReason } from './modules/salad-bowl/models'
import { SaladBowlStoreInterface } from './modules/salad-bowl/SaladBowlStoreInterface'
import { SaladCardStore } from './modules/salad-card/SaladCardStore'
import { SeasonsStore } from './modules/seasons'
import { StartButtonUIStore } from './modules/start-button/StartButtonUIStore'
import { StorefrontStore } from './modules/storefront/StorefrontStore'
import { TermsAndConditionsStore } from './modules/terms-and-conditions'
import { VaultStore } from './modules/vault'
import { VersionStore } from './modules/versions'
import { ExperienceStore } from './modules/xp'
import { SaladFork } from './services/SaladFork/SaladFork'
import { UIStore } from './UIStore'
import { delay } from './utils'

configure({
  // computedRequiresReaction: process.env.NODE_ENV === 'development',
  enforceActions: 'always',
  // observableRequiresReaction: process.env.NODE_ENV === 'development',
  // reactionRequiresObservable: process.env.NODE_ENV === 'development',
})

let sharedStore: RootStore

export const createStore = (axios: AxiosInstance, featureManager: FeatureManager): RootStore => {
  sharedStore = new RootStore(axios, featureManager)
  return sharedStore
}

/** Gets the instance of the store */
//NOTE: Switch this to useContext instead of the singleton
export const getStore = (): RootStore => sharedStore

export class RootStore {
  @observable
  public appLoading: boolean = true
  public appStartTime: Date = new Date()
  public readonly auth: AuthStore
  public readonly termsAndConditions: TermsAndConditionsStore
  public readonly autoStart: AutoStartStore
  public readonly analytics: AnalyticsStore
  public readonly routing: RouterStore
  public readonly xp: ExperienceStore
  public readonly rewards: RewardStore
  public readonly balance: BalanceStore
  public readonly machine: MachineStore
  public readonly profile: ProfileStore
  public readonly ui: UIStore
  public readonly referral: ReferralStore
  public readonly home: HomeStore
  public readonly native: NativeStore
  public readonly refresh: RefreshService
  public readonly saladBowl: SaladBowlStoreInterface
  public readonly notifications: NotificationStore
  public readonly vault: VaultStore
  public readonly version: VersionStore
  public readonly engagement: EngagementStore
  public readonly helpScout: HelpScoutStore
  public readonly storefront: StorefrontStore
  public readonly bonuses: BonusStore
  public readonly seasons: SeasonsStore
  public readonly onboarding: OnboardingStore
  public readonly onboardingAutoStart: OnboardingAutoStartStore
  public readonly onboardingAntivirus: OnboardingAntivirusStore
  public readonly saladFork: SaladFork
  public readonly startButtonUI: StartButtonUIStore
  public readonly machineSettingsUI: MachineSettingsUIStore
  public readonly detectedHardwareUIStore: DetectedHardwareUIStore
  public readonly activeWorkloadsUIStore: ActiveWorkloadsUIStore
  public readonly saladCard: SaladCardStore

  constructor(axios: AxiosInstance, private readonly featureManager: FeatureManager) {
    this.routing = new RouterStore()
    this.auth = new AuthStore(axios, this.routing)
    this.notifications = new NotificationStore(this)
    this.xp = new ExperienceStore(axios)
    this.native = new NativeStore(this)
    this.saladFork = new SaladFork(axios)
    this.saladBowl = new SaladBowlStore(this, featureManager)

    this.machine = new MachineStore(this, axios, featureManager)
    this.profile = new ProfileStore(this, axios)
    this.termsAndConditions = new TermsAndConditionsStore(axios, this.profile)
    this.saladCard = new SaladCardStore(this, axios)
    this.rewards = new RewardStore(this, axios, this.profile, this.saladCard)
    this.analytics = new AnalyticsStore(this)
    this.balance = new BalanceStore(axios)
    this.ui = new UIStore(this)
    this.referral = new ReferralStore(this, axios)
    this.home = new HomeStore(axios)
    this.refresh = new RefreshService(this)
    this.autoStart = new AutoStartStore(this)
    this.vault = new VaultStore(axios, this.balance, this.rewards)
    this.version = new VersionStore(this, axios)
    this.engagement = new EngagementStore(this, axios)
    this.helpScout = new HelpScoutStore(axios, this.analytics, this.auth)
    this.storefront = new StorefrontStore(axios)
    this.bonuses = new BonusStore(this, axios)
    this.seasons = new SeasonsStore(axios)
    this.onboarding = new OnboardingStore(this)
    this.onboardingAutoStart = new OnboardingAutoStartStore(this)
    this.onboardingAntivirus = new OnboardingAntivirusStore(this, this.native)
    this.startButtonUI = new StartButtonUIStore(this)
    this.machineSettingsUI = new MachineSettingsUIStore(this)
    this.detectedHardwareUIStore = new DetectedHardwareUIStore(this)
    this.activeWorkloadsUIStore = new ActiveWorkloadsUIStore(this)

    // Pass AnalyticsStore to FeatureManager
    featureManager.setAnalyticsStore(this.analytics)

    // Start refreshing data
    this.refresh.start()

    autorun(() => {
      if (this.auth.isAuthenticated === undefined) {
        return
      } else if (this.auth.isAuthenticated) {
        this.onLogin()
      } else {
        this.onLogout()
      }
    })
  }

  @action
  setAppLoadedStateFalse = () => {
    this.appLoading = false
  }

  @action
  finishInitialLoading = () => {
    const appLoadFinishedTime = new Date()
    const timeToLoadApp = +appLoadFinishedTime - +this.appStartTime

    // ensures users see the load screen for at least 2 seconds so it doesn't just flash by
    if (timeToLoadApp > 2000) {
      this.setAppLoadedStateFalse()
    } else {
      setTimeout(this.setAppLoadedStateFalse, 2000 - timeToLoadApp)
    }

    if (this.native.isNative && !this.auth.isAuthenticated) {
      this.routing.replace('/login')
    }
  }

  onLogin = flow(
    function* (this: RootStore) {
      var profile: Profile = yield this.profile.loadProfile()
      if (!profile) {
        this.auth.logout()
        return
      }

      this.featureManager.handleLogin(profile.id)

      yield Promise.allSettled([
        this.analytics.start(profile),
        this.native.login(profile),
        this.referral.loadCurrentReferral(),
        this.referral.loadReferralCode(),
        this.refresh.refreshData(),
        this.profile.loadPayPalId(),
        this.saladCard.loadSaladCard(),
        this.helpScout.login({
          name: profile.username,
          email: profile.email,
          lifetimeXP: this.xp.currentXp
        }),
        Promise.race([this.saladBowl.login(), delay(10000)]),
      ])

      if(profile.pendingTermsVersion) {
        yield this.termsAndConditions.submitTermsAndConditions()
      }

      this.finishInitialLoading()
      this.onboarding.showOnboardingIfNeeded()
      this.onboarding.reshowOnboardingPagesIfNeeded()
    }.bind(this),
  )

  @action
  onLogout = (): void => {
    this.saladBowl.stop(StopReason.Logout)

    this.referral.currentReferral = undefined
    this.referral.referralCode = ''
    this.onboarding.resetAccountOnboardingPagesCompleted()

    this.analytics.trackLogout()
    this.native.logout()
    this.helpScout.logout()

    this.featureManager.handleLogout()
    this.finishInitialLoading()
  }
}

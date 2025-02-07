import { connect } from '../../connect'
import { RootStore } from '../../Store'
import { SaladCardEnrollmentPage, SaladCardEnrollmentPageProps } from './pages/SaladCardEnrollmentPage'

const mapStoreToProps = (store: RootStore): Omit<SaladCardEnrollmentPageProps, 'classes'> => ({
  handleCreateSaladCard: store.saladCard.createSaladCard,
  hasAcceptedTerms: store.saladCard.hasAcceptedTerms,
  onToggleAccept: store.saladCard.toggleAcceptTerms,
  isCreateSaladCardLoading: store.saladCard.isCreateSaladCardLoading,
  hasSaladCard: store.saladCard.hasSaladCard,
  handleRouteToStore: store.saladCard.routeToStore,
  handleLoadSaladCard: store.saladCard.loadSaladCard,
})

export const SaladCardEnrollmentPageContainer = connect(mapStoreToProps, SaladCardEnrollmentPage)

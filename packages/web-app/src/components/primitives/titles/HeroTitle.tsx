import { Component, ReactNode } from 'react'
import withStyles, { WithStyles } from 'react-jss'
import { SaladTheme } from '../../../SaladTheme'

const styles = (theme: SaladTheme) => ({
  header: {
    fontFamily: theme.fontGroteskLight25,
    textTransform: 'capitalize',
    lineHeight: '150%',
    fontSize: 36,
    paddingBottom: 20,
  },
})

interface Props extends WithStyles<typeof styles> {
  children?: ReactNode
}

class _HeroTitle extends Component<Props> {
  render() {
    const { children, classes } = this.props

    return <div className={classes.header}>{children}</div>
  }
}

export const HeroTitle = withStyles(styles)(_HeroTitle)

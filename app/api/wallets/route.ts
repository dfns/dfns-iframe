import { DFNS_END_USER_TOKEN_COOKIE } from '../constants'
import { getDfnsDelegatedClient } from '../utils'

export default async function handler(req, res) {
  const endUserAuthToken = req?.cookies?.[DFNS_END_USER_TOKEN_COOKIE] || ''
  if (!endUserAuthToken) {
    return res.status(401).json({ error: 'no user token' })
  }
  try {
    const dfnsDelegated = getDfnsDelegatedClient(endUserAuthToken)
    console.log('getDfnsDelegatedClient dfnsDelegated:', { dfnsDelegated })
    console.log('token:', endUserAuthToken)
    const result = await dfnsDelegated.wallets.listWallets({})
    console.log('error 3')
    console.log('getDfnsDelegatedClient result:', { result })

    return res.status(200).json({ wallets: result?.items || [] })
  } catch (e) {
    // console.log('error:', e)
    return res.status(401).json({ error: `error retrieving wallets ${e}` })
  }
}

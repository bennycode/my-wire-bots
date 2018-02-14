require('dotenv').config()

import {Account} from '@wireapp/core'
import {PayloadBundle} from '@wireapp/core/dist/commonjs/crypto/'
import {LoginData} from '@wireapp/api-client/dist/commonjs/auth/'

const account = new Account()

const login: LoginData = {
  email: String(process.env.WIRE_EMAIL),
  password: String(process.env.WIRE_PASSWORD),
  persist: false,
}

account.on(Account.INCOMING.TEXT_MESSAGE, (data: PayloadBundle) => {
  account.service.conversation.sendTextMessage(data.conversation, data.content)
})

account.listen(login).catch((error: Error) => {
  console.error(error.stack, error)
  return process.exit(1)
})

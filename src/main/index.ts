require('dotenv').config()

import {Account} from '@wireapp/core'
import {PayloadBundle} from '@wireapp/core/dist/commonjs/crypto/'
import {LoginData} from '@wireapp/api-client/dist/commonjs/auth/'

const boggle = require('pf-boggle')
let cachedWords: string[] = []

const account = new Account()

const BOT_ID = 'c48d3a2a-bc15-45ab-902a-5dad253b0191'

const login: LoginData = {
  email: String(process.env.WIRE_EMAIL),
  password: String(process.env.WIRE_PASSWORD),
  persist: false,
}

account.on(Account.INCOMING.TEXT_MESSAGE, (data: PayloadBundle) => {
  if (data.from === BOT_ID) {
    if (data.content.indexOf('Your letters') > -1) cachedWords = []
    const start = data.content.indexOf('\n')
    if (start > 0) {
      const letters = data.content.substr(start + 1)
      const chars = letters.split(' ')
      const solution = boggle.solve(chars)
      const words: string[] = solution.map((item: { [index: string]: string }) => item.word)
      for (let i = 0; i < words.length; i++) {
        const word: string = words.pop() + ''
        if (!cachedWords.includes(word)) {
          account.service.conversation.sendTextMessage(data.conversation, '' + word)
          cachedWords.push(word)
        }
      }
    }
  }
})

account.listen(login).catch((error: Error) => {
  console.error(error.stack, error)
  return process.exit(1)
})

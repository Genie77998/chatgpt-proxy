const { Configuration, OpenAIApi } = require('openai')
const input = require('@inquirer/input').default
const ora = require('ora')
const chalk = require('chalk')
const { getConfig } = require('./util')
const config = getConfig()
const configuration = new Configuration({
    apiKey: config.apiKey,
});
const openai = new OpenAIApi(configuration)
const messages = []

const roles = ["user", "system", "assistant"]

const sendMsg = async (content, role = roles[0]) => {
  messages.push({
    role, content
  })
  let error = new Error('请重试')
  return new Promise(async (resolve, reject) => {
    const completion = await openai.createChatCompletion({
      model: config.model,
      messages
    }, config.axiosRequestConfig).catch(err => {
      error = err
    })
    const message = completion?.data?.choices?.[0]?.message
    if (message) {
      messages.push(message)
      return resolve({
        content: message?.content
      })
    }
    reject(error)
  })
  
}

const prompt = async () => {
  if (messages?.[0]?.role !== roles[1]) {
    const preset = await input({ message: chalk.yellow('请输入预设情景') })
    if (preset) {
      messages.push({
        role: roles[1], content: preset
      })
    }
  }
  const answer = await input({ message: chalk.yellow('请输入你的问题') })
  if (!answer) {
    return prompt()
  }
  const spinner = ora('Loading...').start()
  const res = await sendMsg(answer).catch(err => {
    return Promise.resolve({
      content: err?.toJSON()?.message ?? err?.message,
      isError: true
    })
  })
  spinner.stop()
  console.log(chalk[res.isError ? "red" : "green"](res.content))
  prompt()
}


prompt()


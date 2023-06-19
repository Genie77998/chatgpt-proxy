const { resolve, join } = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const { homedir } = require('os')

const resolvePath = (...rest) => resolve(process.cwd(), ...rest)

const configPath = join(homedir(), '.openai-config.json')

function getConfig() {
  try {
    return fs.readJsonSync(configPath)
  } catch (error) {
    console.log(chalk.red(`请在配置文件${configPath}中填写配置`))
    fs.writeJSONSync(configPath, {
      "apiKey": "",
      "model": "gpt-3.5-turbo",
      "axiosRequestConfig": {}
    }, { encoding: 'utf8' })
    process.exit(0)
    return {}
  }
}

module.exports = {
  getConfig,
  resolvePath
}

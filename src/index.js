/*
 * @Author: HoangManhPhu
 * @Date:   2017-11-22 23:20:36
 * @Last Modified by:   Phu Hoang
 * @Last Modified time: 2017-12-03 00:20:11
 */

const _ = require('lodash')
const Promise = require('bluebird')
const botbuilder = require('botbuilder')
const incoming = require('./incoming')
const outgoing = require('./outgoing')
const UMM = require('./umm')
const actions = require('./actions')

let msbotfw = null
let connector = null

const outgoingMiddleware = (event, next) => {
    if (event.platform !== 'msbotfw') {
        return next()
    }
    if (!outgoing[event.type]) {
        return next('Unsupported event type: ' + event.type)
    }

    outgoing[event.type](event, next, msbotfw)
}

module.exports = {

    config: {
        applicationID: {
            type: 'string',
            required: true,
            env: 'MSBOTFW_APP_ID'
        },
        applicationPassword: {
            type: 'string',
            required: true,
            env: 'MSBOTFW_APP_PASSWORD'
        },
    },

    init: function(bp) {
        bp.middlewares.register({
            name: 'msbotfw.sendMessages',
            type: 'outgoing',
            order: 100,
            handler: outgoingMiddleware,
            module: 'botpress-msbotfw',
            description: 'Sends out messages that targets platform = msbotfw.' +
                ' This middleware should be placed at the end as it swallows events once sent.'
        })

        bp.msbotfw = {}
        _.forIn(actions, (action, name) => {
            bp.msbotfw[name] = action
            var sendName = name.replace(/^create/, 'send')
            bp.msbotfw[sendName] = Promise.method(function() {
                var msg = action.apply(this, arguments)
                msg.__id = new Date().toISOString() + Math.random()
                const resolver = {
                    event: msg
                }
                const promise = new Promise(function(resolve, reject) {
                    resolver.resolve = resolve
                    resolver.reject = reject
                })
                bp.middlewares.sendOutgoing(msg)
                return promise
            })
        })

        UMM(bp)
    },

    ready: async function(bp, configurator) {
        const config = await configurator.loadAll()
        let connectorConfig = {}

        connectorConfig.appId = config.applicationID || console.error('MSBOTFW_APP_ID is not defined')
        connectorConfig.appPassword = config.applicationPassword || console.error('MSBOTFW_APP_PASSWORD is not defined')

        connector = new botbuilder.ChatConnector(connectorConfig)

        const setConfigAndRestart = async newConfigs => {
            await configurator.saveAll(newConfigs)
            connectorConfig.appId = newConfigs.applicationID
            connectorConfig.appPassword = newConfigs.applicationPassword
            connector = new botbuilder.ChatConnector(connectorConfig)
        }

        const router = bp.getRouter('botpress-msbotfw', {
            auth: false
        })

        router.post('/messages', connector.listen())

        router.get('/config', async (req, res) => {
            res.json(await configurator.loadAll())
        })

        router.post('/config', async (req, res) => {
            setConfigAndRestart(req.body)
            res.json(await configurator.loadAll())
        })

        router.get('/ping', (req, res, next) => res.send('pong'))

        router.get('/', (req, res, next) => {
            res.send('Server is running')
            next()
        })

        msbotfw = new botbuilder.UniversalBot(connector)
        incoming(bp, msbotfw)
    }
}
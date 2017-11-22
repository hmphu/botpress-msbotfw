/*
* @Author: HoangManhPhu
* @Date:   2017-11-22 09:34:29
* @Last Modified by:   Phu Hoang
* @Last Modified time: 2017-11-23 01:41:35
*/

const Users = require('./users')

module.exports = (bp, msbotfw) => {
    const users = Users(bp, msbotfw)

    const sendMessageToIncomingMiddlewares = (session, user) => {
        // push the message to the incoming middleware
        bp.middlewares.sendIncoming({
            type: session.message.type,
            text: session.message.text || '',
            user: user,
            platform: 'msbotfw',
            raw: session.message,
            session
        })
    }
    msbotfw.dialog('/', function(session) {
        users.getOrFetchUserProfile(session).then(user => {
            sendMessageToIncomingMiddlewares(session, user)
        })
    })
}
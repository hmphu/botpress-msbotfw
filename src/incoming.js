/*
 * @Author: HoangManhPhu
 * @Date:   2017-11-22 09:34:29
 * @Last Modified by:   Phu Hoang
 * @Last Modified time: 2017-12-03 03:24:00
 */

const Users = require('./users')

module.exports = (bp, msbotfw) => {
    const users = Users(bp, msbotfw)

    //=========================================================
    // Activity Events
    //=========================================================
    msbotfw.on('contactRelationUpdate', function (message) {
        if(message.action == 'add'){
            users.getOrFetchUserProfile({message}).then(user => {
                bp.middlewares.sendIncoming({
                    type: 'contactRelationUpdate',
                    text: 'add',
                    user: user,
                    platform: 'msbotfw',
                    raw: message,
                    message
                })
            })
        }
        else{
            const userId = message.user.id || message.address.user.id
            users.removeSkypeAddress(userId)
            bp.middlewares.sendIncoming({
                type: 'contactRelationUpdate',
                text: 'remove',
                platform: 'msbotfw',
                user: null,
                raw: message,
                message
            })
        }
    });

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
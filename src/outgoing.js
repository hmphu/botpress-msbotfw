/*
* @Author: HoangManhPhu
* @Date:   2017-11-22 23:25:44
* @Last Modified by:   Phu Hoang
* @Last Modified time: 2017-11-23 01:41:31
*/

const _ = require('lodash')
const botbuilder = require('botbuilder')

const handleText = (event, next, msbotfw) => {
    if (event.platform !== 'msbotfw' || event.type !== 'text') {
        return next()
    }
    const session = event.session
    const user = event.user
    const bp = event.bp
    const replied = event.raw
    if (session) {
        if (_.isArray(replied)) {
            replied.forEach(r => session.send(r))
        } else {
            session.send(replied)
        }
    } else if (user) {
        const userId = event.user.id || event.user.userId || event.address.user.id 
        bp.db.kvs.get(`users/id/${userId}/skype_address`).then(address => {
            if(address){
                var msg = new botbuilder.Message().address(address)
                if (_.isArray(replied)) {
                    replied.forEach(r => {
                        msg.text(r)
                        msbotfw.send(msg)
                    })
                } else {
                    msg.text(replied)
                    msbotfw.send(msg)
                }
            }
        })
    }
    return next()
}
module.exports = {
    'text': handleText
}
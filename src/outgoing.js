/*
 * @Author: HoangManhPhu
 * @Date:   2017-11-22 23:25:44
 * @Last Modified by:   Phu Hoang
 * @Last Modified time: 2017-12-03 03:36:31
 */

const _ = require('lodash')
const botbuilder = require('botbuilder')
const Users = require('./users')

const handleText = (event, next, msbotfw) => {
    if (event.platform !== 'msbotfw' || event.type !== 'text') {
        return next()
    }
    const session = event.session || event.raw.session
    const address = event.address || event.raw.address
    const user = event.user
    const users = Users(event.bp, msbotfw)
    const replied = event.raw

    if (session && session.send) {
        if (_.isArray(replied)) {
            replied.forEach(r => session.send(r))
        } else {
            session.send(replied)
        }
    } else if(address){
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
    } else if (user) {
        const userId = user.id || user.userId
        users.getSkypeAddress(userId).then(address => {
            if (address) {
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

const handleAttachment = (event, next, msbotfw) => {
    if (event.platform !== 'msbotfw' || event.type !== 'attachment') {
        return next()
    }
    const session = event.session || event.raw.session
    const address = event.address || event.raw.address
    const user = event.user
    const users = Users(event.bp, msbotfw)
    var replied = event.raw.message.attachments || event.raw;

    if (session) {
        const msg = new botbuilder.Message(session)
        if (_.isArray(replied)) {
            replied.forEach(r => msg.addAttachment(r))
        } else {
            msg.addAttachment(replied)
        }
        msbotfw.send(msg)

    } else if (address) {
        var msg = new botbuilder.Message().address(address)
        if (_.isArray(replied)) {
            replied.forEach(r => {
                msg.addAttachment(r)
            })
        } else {
            msg.addAttachment(replied)
        }

        msbotfw.send(msg)
    } else if (user) {
        const userId = user.id || user.userId
        users.getSkypeAddress(userId).then(address => {
            if (address) {
                var msg = new botbuilder.Message().address(address)
                if (_.isArray(replied)) {
                    replied.forEach(r => {
                        msg.addAttachment(r)
                    })
                } else {
                    msg.addAttachment(replied)
                }

                msbotfw.send(msg)
            }
        })
    }
    return next()
}

module.exports = {
    'text': handleText,
    'attachment': handleAttachment
}
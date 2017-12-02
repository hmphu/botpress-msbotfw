/*
 * @Author: HoangManhPhu
 * @Date:   2017-11-22 13:07:34
 * @Last Modified by:   Phu Hoang
 * @Last Modified time: 2017-12-03 00:20:26
 */

const Promise = require('bluebird')
const _ = require('lodash')

const create = obj => {
  let resolve = null
  let reject = null
  const promise = new Promise((r, rj) => {
    resolve = r
    reject = rj
  })

  const messageId = new Date().toISOString() + Math.random()

  const newEvent = Object.assign({
    _promise: promise,
    _resolve: resolve,
    _reject: reject,
    __id: messageId
  }, obj)

  return newEvent
}

const createText = (session, message) => {
  return {
    platform: 'msbotfw',
    type: 'text',
    text: 'msbotfw',
    raw: message,
    session
  }
}

const createTextToUser = (user, message) => {
  return {
    platform: 'msbotfw',
    type: 'text',
    text: 'msbotfw',
    raw: message,
    user
  }
}

const createAttachment = (session, object) => {
  var data = object.contentType ? {
    attachments: [object]
  } : object

  // console.log(data)

  return create({
    platform: 'msbotfw',
    type: 'attachment',
    text: typeof object === 'string' ? object : _.get(data, 'attachments[0].content.text') || object.text || 'N/A',
    user: session.user,
    raw: {
      session: session,
      message: data
    }
  });
}

const createAttachmentToUser = (user, object) => {
  var data = object.contentType ? {
    attachments: [object]
  } : object

  return create({
    platform: 'msbotfw',
    type: 'attachment',
    text: typeof object === 'string' ? object : _.get(data, 'attachments[0].content.text') || object.text || 'N/A',
    user: user,
    raw: {
      message: data
    }
  });
}


module.exports = {
  createText,
  createTextToUser,
  createAttachment,
  createAttachmentToUser
}
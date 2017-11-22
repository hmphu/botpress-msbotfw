/*
* @Author: HoangManhPhu
* @Date:   2017-11-22 23:25:38
* @Last Modified by:   Phu Hoang
* @Last Modified time: 2017-11-23 01:41:57
*/

const actions  = require('./actions')
const _  = require('lodash')

function processOutgoing({ event, blocName, instruction }) {
  const ins = Object.assign({}, instruction) // Create a shallow copy of the instruction

  ////////
  // PRE-PROCESSING
  ////////
  
  const optionsList = [
    'quick_replies', 
    'waitRead', 
    'waitDelivery', 
    'typing', 
    'tag',
    '__platformSpecific',
    'on'
  ]

  const options = _.pick(instruction, optionsList)
  
  for (let prop of optionsList) {
    delete ins[prop]
  }

  if (options.quick_replies) {
    options.quick_replies = processQuickReplies(options.quick_replies, blocName)
  }

  /////////
  /// Processing
  /////////

  if (!_.isNil(instruction.contentType) || !_.isNil(instruction.attachments)) {
    if(event.session){
      return actions.createObject(event.session, ins)
    }
    else if(event.user){
      return actions.createObjectToUser(event.user, ins)
    }
  }

  if (!_.isNil(instruction.text)) {
    if(event.session){
      return actions.createText(event.session, instruction.text)
    }
    else if(event.user){
      return actions.createTextToUser(event.user, instruction.text)
    }
  }

  ////////////
  /// POST-PROCESSING
  ////////////
  
  // Nothing to post-process yet

  ////////////
  /// INVALID INSTRUCTION
  ////////////

  const strRep = util.inspect(instruction, false, 1)
  throw new Error(`Unrecognized instruction on Bot Framework in bloc '${blocName}': ${strRep}`)
}

function getTemplates() {
    return [];
}

module.exports = bp => {
  const [umm, registerConnector] = _.at(bp, ['umm', 'umm.registerConnector'])

  umm && registerConnector && registerConnector({
    platform: 'msbotfw',
    processOutgoing: args => processOutgoing(Object.assign({}, args, { bp })),
    templates: getTemplates()
  })
}
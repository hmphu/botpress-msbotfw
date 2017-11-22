/*
* @Author: Phu Hoang
* @Date:   2017-11-23 00:52:02
* @Last Modified by:   Phu Hoang
* @Last Modified time: 2017-11-23 01:41:44
*/

const _ = require('lodash')

module.exports = function(bp, messenger) {

  function profileToDbEntry(profile) {
        return {
            id: profile.id,
            platform: 'msbotfw',
            gender: profile.gender,
            timezone: profile.timezone,
            locale: profile.locale,
            picture_url: profile.profile_pic,
            first_name: profile.first_name,
            last_name: profile.last_name
        }
    }

    function dbEntryToProfile(db) {
        return {
            gender: db.gender,
            timezone: db.timezone,
            locale: db.locale,
            profile_pic: db.picture_url,
            first_name: db.first_name,
            last_name: db.last_name,
            id: db.userId
        }
    }

    async function getOrFetchUserProfile(session) {
        const knex = await bp.db.get()
        const userId = session.message.user.id || session.message.address.user.id

        const user = await knex('users').where({
            platform: 'msbotfw',
            'userId': userId
        }).then().get(0).then()

        if (user) {
            bp.db.kvs.set(`users/id/msbotfw:${userId}/skype_address`, session.message.address)
            return dbEntryToProfile(user)
        }

        const profile = {
            id: userId,
            platform: 'msbotfw',
            gender: null,
            timezone: null,
            locale: null,
            picture_url: null,
            first_name: null,
            last_name: null
        }

        await bp.db.saveUser(profileToDbEntry(profile))
        
        bp.db.kvs.set(`users/id/msbotfw:${userId}/skype_address`, session.message.address)

        return profile
    }

  return { getOrFetchUserProfile }
}
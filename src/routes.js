const express = require('express')
const { userSignup, userSignin, authMe } = require('./controller/user')
const { createCommunity, allCommunity, getAllMembers, myOwnedCommunity, myJoinedCommunity } = require('./controller/community')
const { authentication, authorization } = require('./Auth')
const { createRole, getAllRole } = require('./controller/role')
const { addMember, removeMember } = require('./controller/member')
const router = express.Router()


// --------- Role Api -----------//

router.post('/v1/role',createRole)
router.get('/v1/role',getAllRole)


// ---------User Api-------------//

router.post('/v1/auth/signup',userSignup)
router.post('/v1/auth/signin',userSignin)
router.get('/v1/auth/me',authentication, authMe)


// ---------Community Api----------//

router.post('/v1/community',authentication, createCommunity)
router.get('/v1/community', allCommunity)
router.get('/v1/community/:id/members',getAllMembers)
router.get('/v1/community/me/owner',authentication,myOwnedCommunity)
router.get('/v1/community/me/member',authentication,myJoinedCommunity)


// ---------Member Api------------//

router.post('/v1/member',authentication, addMember)
router.delete('/v1/member/:id',authentication, removeMember)


module.exports = router
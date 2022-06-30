const router = require('express').Router()

const conversationController = require('../controllers/ConversationController')

router.get('/:userId', conversationController.getConversationOfUser)

router.get('/:firstUserId/:secondUserId', conversationController.getConversationOfTwoUser)

router.post('/', conversationController.createConversation)
module.exports = router

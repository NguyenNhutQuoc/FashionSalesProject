const router = require('express').Router()

const conversationController = require('../controllers/ConversationController')

router.get('/', conversationController.getConversationOfUser)

router.post('/', conversationController.createConversation)

module.exports = router

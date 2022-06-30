const router = require('express').Router()

const messageController = require('../controllers/MessageController')

router.get('/:conversationId', messageController.getMessagesByConversation)

router.post('/', messageController.createMessage)

module.exports = router
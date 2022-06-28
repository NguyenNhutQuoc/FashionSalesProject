const router = require('express').Router()

const commentController = require('../controllers/CommentController')
router.get('/:id', commentController.findById)
router.get('/', commentController.findAll)
router.get('/search', commentController.findBy)
router.post('/', commentController.create)
router.put('/:id', commentController.update)
router.delete('/:id/:user', commentController.delete)
module.exports = router
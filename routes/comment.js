const router = require('express').Router()

const commentController = require('../controllers/CommentController')

router.get('/', commentController.findAll)
router.get('/search', commentController.findBy)
router.post('/', commentController.create)
router.put('/:id', commentController.update)
router.delete('/:id', commentController.delete)

module.exports = router
const {
    Users,
    Comments,
    Actions
} = require('../model/model');

const ActionController = {
    create: async (req, res) => {
        try {
            const {
                user,
                comment
            } = req.body
            const action = await Actions.find({
                user: user,
                comment: comment
            })
            if (action.length === 0) {
                const newAction = await Actions.create({
                    user: user,
                    comment: comment
                })

                await Users.findByIdAndUpdate(user, {
                    $push: {
                        actions: newAction._id
                    }
                })

                await Comments.findByIdAndUpdate(comment, {
                    $push: {
                        actions: newAction._id
                    }
                })
                res.status(200).json(newAction)
            } else {
                res.status(200).json(null)
            }
        } catch (err) {
            res.status(500).json(err)
        }
    }
}

module.exports = ActionController
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
            const action = await Actions.create({
                user: user,
                comment: comment
            })

            await Users.findByIdAndUpdate(user, {
                $push: {
                    actions: action._id
                }
            })

            await Comments.findByIdAndUpdate(comment, {
                $push: {
                    actions: action._id
                }
            })
            res.status(200).json(action)
        } catch (err) {
            res.status(500).json(err)
        }
    }
}

module.exports = ActionController
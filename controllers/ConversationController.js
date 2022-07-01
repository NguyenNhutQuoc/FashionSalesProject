const {
    Conversations
} = require('../model/model');

const ConversationController = {

    //[POST] /api/conversations
    createConversation: async (req, res) => {
        const newConversation = new Conversations({
            members: [req.body.senderId, req.body.receiverId],
        });

        try {
            const savedConversation = await newConversation.save();
            res.status(200).json(savedConversation);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    //[GET] /api/conversations/:userId
    getConversationOfUser: async (req, res) => {
        try {
            const conversation = await Conversations.find({
                $in: {
                    members: req.params.userId
                }
            }).populate('members');
            res.status(200).json(conversation);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    //[GET] /api/conversations/:firstUserId/:secondUserId
    getConversationOfTwoUser: async (req, res) => {
        try {
            const conversation = await Conversations.findOne({
                $all: {
                    members: [req.params.firstUserId, req.params.secondUserId]
                }
            }).populate('members');
            res.status(200).json(conversation)
        } catch (err) {
            res.status(500).json(err);
        }
    }
}

module.exports = ConversationController
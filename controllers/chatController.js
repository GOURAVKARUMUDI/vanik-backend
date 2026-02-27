const db = require('../config/db');

// @desc    Get chat history between two users for a specific product
// @route   GET /api/chat/:userId/:productId
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const currentUserId = req.user.id;

        const [messages] = await db.query(`
      SELECT * FROM Messages 
      WHERE product_id = ? AND 
      ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
      ORDER BY created_at ASC
    `, [productId, currentUserId, userId, userId, currentUserId]);

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching chat history' });
    }
};

// @desc    Get all active chats for logged in user
// @route   GET /api/chat/mychats
// @access  Private
const getMyChats = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const [chats] = await db.query(`
      SELECT DISTINCT m.product_id, p.title as product_title, 
      IF(m.sender_id = ?, m.receiver_id, m.sender_id) as other_user_id,
      u.name as other_user_name
      FROM Messages m
      JOIN Products p ON m.product_id = p.id
      JOIN Users u ON u.id = IF(m.sender_id = ?, m.receiver_id, m.sender_id)
      WHERE m.sender_id = ? OR m.receiver_id = ?
    `, [currentUserId, currentUserId, currentUserId, currentUserId]);

        res.json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching chats' });
    }
};

module.exports = {
    getChatHistory,
    getMyChats
};

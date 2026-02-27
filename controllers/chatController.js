import { db } from '../firebaseAdmin.js';

// @desc    Get chat history between two users for a specific product
// @route   GET /api/chat/:userId/:productId
// @access  Private
const getChatHistory = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const currentUserId = req.user.uid || req.user._id || req.user.id;

        const snapshot = await db.ref('messages').once('value');
        if (!snapshot.exists()) return res.json([]);

        let messages = [];
        snapshot.forEach(snap => {
            const msg = snap.val();
            // Assuming messages schema has product_id, sender_id, receiver_id
            if (msg.product_id === productId) {
                if (
                    (msg.sender_id === currentUserId && msg.receiver_id === userId) ||
                    (msg.sender_id === userId && msg.receiver_id === currentUserId)
                ) {
                    messages.push({ id: snap.key, ...msg });
                }
            }
        });

        // Sort by created_at ASC
        messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

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
        const currentUserId = req.user.uid || req.user._id || req.user.id;

        const snapshot = await db.ref('messages').once('value');
        if (!snapshot.exists()) return res.json([]);

        let chatMap = {}; // Use a map to mimic DISTINCT by product_id & other_user_id

        for (const [key, msg] of Object.entries(snapshot.val())) {
            if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
                const otherUserId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
                const uniqueKey = `${msg.product_id}_${otherUserId}`;

                if (!chatMap[uniqueKey]) {
                    // We need to fetch product info and other user info manually
                    const [prodSnap, userSnap] = await Promise.all([
                        db.ref(`products/${msg.product_id}`).once('value'),
                        db.ref(`users/${otherUserId}`).once('value')
                    ]);

                    chatMap[uniqueKey] = {
                        product_id: msg.product_id,
                        product_title: prodSnap.exists() ? prodSnap.val().title : 'Unknown Product',
                        other_user_id: otherUserId,
                        other_user_name: userSnap.exists() ? userSnap.val().name : 'Unknown User'
                    };
                }
            }
        }

        res.json(Object.values(chatMap));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching chats' });
    }
};

export { getChatHistory, getMyChats };

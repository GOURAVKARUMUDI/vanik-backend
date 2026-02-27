import { Server } from 'socket.io';
import { db } from './firebaseAdmin.js';

const socketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ['http://localhost:5173', 'https://vanik-kappa.vercel.app'],
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a private chat room
        socket.on('join_room', (data) => {
            socket.join(data);
            console.log(`User ${socket.id} joined room: ${data}`);
        });

        // Handle sending message
        socket.on('send_message', async (data) => {
            try {
                // Assuming data has sender, receiver, content, and possibly product_id
                const { sender, receiver, content, room, productId } = data;

                const newMessageRef = db.ref('messages').push();
                const messageObj = {
                    id: newMessageRef.key,
                    sender_id: sender,
                    receiver_id: receiver,
                    content,
                    product_id: productId || null,
                    room: room || null,
                    createdAt: Date.now()
                };

                await newMessageRef.set(messageObj);

                // Emit to the specific room
                io.to(room).emit('receive_message', data);
            } catch (error) {
                console.error('Error saving message to Firebase:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export default socketIO;

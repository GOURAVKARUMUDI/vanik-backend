import { Server } from 'socket.io';
import Message from './models/Message.js';

const socketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
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
                const { sender, receiver, content, room } = data;

                const newMessage = new Message({
                    sender,
                    receiver,
                    content,
                });

                await newMessage.save();

                // Emit to the specific room
                io.to(room).emit('receive_message', data);
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export default socketIO;

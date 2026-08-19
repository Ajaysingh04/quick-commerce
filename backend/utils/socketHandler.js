const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    // Join order-specific tracking room
    socket.on('joinOrderRoom', ({ orderId }) => {
      socket.join(`order_${orderId}`);
      console.log(`Client ${socket.id} joined room: order_${orderId}`);
    });

    // Leave order room when completed/exited
    socket.on('leaveOrderRoom', ({ orderId }) => {
      socket.leave(`order_${orderId}`);
      console.log(`Client ${socket.id} left room: order_${orderId}`);
    });

    // Join Group collaborative cart room
    socket.on('joinGroupRoom', ({ code }) => {
      socket.join(`group_${code}`);
      console.log(`Client ${socket.id} joined group room: group_${code}`);
    });

    // Leave Group room
    socket.on('leaveGroupRoom', ({ code }) => {
      socket.leave(`group_${code}`);
      console.log(`Client ${socket.id} left group room: group_${code}`);
    });

    // Join Delivery Partners broadcast room
    socket.on('joinDeliveryRoom', () => {
      socket.join('delivery_partners');
      console.log(`Client ${socket.id} joined delivery_partners room`);
    });

    // Leave Delivery Partners broadcast room
    socket.on('leaveDeliveryRoom', () => {
      socket.leave('delivery_partners');
      console.log(`Client ${socket.id} left delivery_partners room`);
    });

    // Listen to delivery partner live tracking coordinates feeds
    socket.on('sendCoordinates', ({ orderId, lat, lng }) => {
      // Broadcast live coordinates to everyone in the room (the ordering user client)
      io.to(`order_${orderId}`).emit('coordinatesUpdated', {
        orderId,
        coordinates: { lat, lng }
      });
      console.log(`Order ${orderId} location stream: lat=${lat}, lng=${lng}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket Client Disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;

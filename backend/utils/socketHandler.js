const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket Client Connected: ${socket.id}`);

    // Join Admin room for real-time fleet & store notifications
    socket.on('joinAdminRoom', () => {
      socket.join('admin_room');
      console.log(`Admin client ${socket.id} joined admin_room`);
    });

    socket.on('leaveAdminRoom', () => {
      socket.leave('admin_room');
      console.log(`Admin client ${socket.id} left admin_room`);
    });

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

    // Rider Duty Status Toggle (Online / Offline)
    socket.on('riderDutyChanged', ({ riderId, riderName, isOnline }) => {
      io.emit('adminNotification', {
        title: isOnline ? 'Rider On Duty' : 'Rider Off Duty',
        message: `${riderName || 'Rider'} is now ${isOnline ? 'ONLINE and ready for orders' : 'OFFLINE'}.`,
        riderId,
        isOnline,
        type: 'info',
        date: new Date()
      });
      console.log(`Rider ${riderName} duty changed: ${isOnline ? 'Online' : 'Offline'}`);
    });

    // Rider Emergency SOS Alert
    socket.on('riderEmergencySos', ({ riderId, riderName, location }) => {
      io.emit('adminNotification', {
        title: '🚨 EMERGENCY SOS ALERT',
        message: `Rider ${riderName || 'Unknown'} triggered Emergency SOS! Please check immediately.`,
        riderId,
        location,
        type: 'danger',
        date: new Date()
      });
      console.log(`EMERGENCY SOS from rider: ${riderName}`);
    });

    // Listen to delivery partner live tracking coordinates feeds
    socket.on('sendCoordinates', ({ orderId, lat, lng }) => {
      // Broadcast live coordinates to everyone in the room (the ordering user client & admin)
      io.to(`order_${orderId}`).emit('coordinatesUpdated', {
        orderId,
        coordinates: { lat, lng }
      });
      io.emit('adminRiderCoordinates', {
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

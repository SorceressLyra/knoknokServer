Bun.serve({
    fetch(req, server) {
      server.upgrade(req, {
        data: {
          createdAt: Date.now(),
        }
      });
    }, // upgrade logic
    websocket: {
      message(ws, message) {
          console.log(message);
          ws.send(message);
      }, // a message is received
      open(ws) {}, // a socket is opened
      close(ws, code, message) {}, // a socket is closed
      drain(ws) {}, // the socket is ready to receive more data
    },
  });
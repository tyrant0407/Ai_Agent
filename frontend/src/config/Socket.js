import socket from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
    if (socketInstance) return socketInstance; // Singleton pattern
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Authentication token not found');
    }

    socketInstance = socket(import.meta.env.VITE_API_URL, {
        auth: { token },
        query: { projectId },
    });

    // Event handlers
    socketInstance.on('connect', () => {
        console.log(`Socket connected ${socketInstance.id} `);
    });

    socketInstance.on('connect_error', (error) => {
        console.error(`Socket connection error ${socketInstance.id} `, error);
    });

    socketInstance.on('disconnect', (reason) => {
        console.log(`Socket disconnected ${socketInstance.id} `);
    });

    return socketInstance;
};

export const getSocket = () => {
    if (!socketInstance) {
        return initializeSocket();
    }
    return socketInstance;
};

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};

export const receiveMessage = (eventName,cb)=>{
    socketInstance.on(eventName,cb);
}

export const sendMessage = (eventName,data)=>{
    socketInstance.on(eventName,data);
}
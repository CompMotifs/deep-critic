import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { log } from './vite';

// Map to store active connections by job ID
const clients = new Map<string, Set<WebSocket>>();

// Maintain client to job mapping for quick lookups
const clientJobs = new Map<WebSocket, string>();

export function setupWebSocketServer(server: Server): WebSocketServer {
  // Use a specific path to avoid conflicts with Vite's own WebSocket
  const wss = new WebSocketServer({ 
    server, 
    path: '/api/ws' 
  });
  
  wss.on('connection', (ws: WebSocket) => {
    log('WebSocket client connected');
    
    // Listen for messages from the client
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle subscription to a job
        if (data.type === 'subscribe' && data.jobId) {
          const jobId = data.jobId as string;
          
          // Store the job ID for this client
          clientJobs.set(ws, jobId);
          
          // Add this client to the map for the specified job
          if (!clients.has(jobId)) {
            clients.set(jobId, new Set());
          }
          
          const jobClients = clients.get(jobId);
          if (jobClients) {
            jobClients.add(ws);
          }
          
          log(`Client subscribed to job: ${jobId}`);
          
          // Send confirmation back to client
          ws.send(JSON.stringify({
            type: 'subscribed',
            jobId
          }));
        }
      } catch (error) {
        log(`Error parsing WebSocket message: ${error}`);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      // Get job ID from the client mapping
      const jobId = clientJobs.get(ws);
      
      if (jobId && clients.has(jobId)) {
        const jobClients = clients.get(jobId);
        if (jobClients) {
          jobClients.delete(ws);
          
          // Clean up empty sets
          if (jobClients.size === 0) {
            clients.delete(jobId);
          }
          
          log(`Client unsubscribed from job: ${jobId}`);
        }
      }
      
      // Remove from client tracking
      clientJobs.delete(ws);
      
      log('WebSocket client disconnected');
    });
  });
  
  return wss;
}

// Function to send updates to clients subscribed to a specific job
export function sendJobUpdate(jobId: string, data: unknown): void {
  const jobClients = clients.get(jobId);
  
  if (jobClients && jobClients.size > 0) {
    const message = JSON.stringify({
      type: 'update',
      jobId,
      data,
      timestamp: new Date().toISOString()
    });
    
    let deadClients = 0;
    
    jobClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      } else {
        // Mark for removal if not connected
        deadClients++;
      }
    });
    
    log(`Sent update to ${jobClients.size - deadClients} clients for job: ${jobId}`);
  }
}
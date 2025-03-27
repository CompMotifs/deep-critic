import { useState, useEffect, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  jobId: string;
  data?: any;
  timestamp?: string;
}

interface JobStatus {
  progress: number;
  stage: string;
  estimatedTimeRemaining: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  message?: string;
  result?: any;
  agentStatuses?: Record<string, 'waiting' | 'processing' | 'completed' | 'failed'>;
  // Additional properties from the API specification
  currentModel?: string;
  completedModels?: string[];
  remainingModels?: string[];
}

/**
 * Hook to connect to and manage WebSocket connection for job updates
 * @param jobId The ID of the job to subscribe to
 * @returns Object containing job status and connection state
 */
export function useJobWebSocket(jobId: string | null) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create and setup WebSocket connection
  useEffect(() => {
    if (!jobId) return;

    // Close any existing connection
    if (socket) {
      socket.close();
    }

    // Create new WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    const newSocket = new WebSocket(wsUrl);

    // Setup event handlers
    newSocket.onopen = () => {
      setConnected(true);
      setError(null);
      
      // Subscribe to job updates
      newSocket.send(JSON.stringify({
        type: 'subscribe',
        jobId
      }));
    };

    newSocket.onclose = () => {
      setConnected(false);
    };

    newSocket.onerror = (event) => {
      setError('WebSocket connection error');
      console.error('WebSocket error:', event);
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        
        // Handle different message types
        if (message.type === 'update' && message.jobId === jobId) {
          setJobStatus(message.data);
        } else if (message.type === 'subscribed' && message.jobId === jobId) {
          console.log(`Successfully subscribed to updates for job: ${jobId}`);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    setSocket(newSocket);

    // Cleanup function to close socket when component unmounts or jobId changes
    return () => {
      newSocket.close();
    };
  }, [jobId]);

  // Function to manually send a message
  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [socket]);

  return {
    connected,
    jobStatus,
    error,
    sendMessage
  };
}
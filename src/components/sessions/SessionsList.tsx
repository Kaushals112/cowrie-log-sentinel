
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchSessionsData, Session } from "@/services/api";
import { Clock, AlertCircle, Loader2, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchSessionsData();
        setSessions(response.sessions);
        setTotalSessions(response.total);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        toast({
          title: "Error",
          description: "Failed to load sessions data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Count commands in a session
  const countCommands = (session: Session) => {
    return session.events.filter(event => 
      event.message?.includes("Command execution") || event.ml_output
    ).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Terminal className="h-5 w-5 mr-2" />
          Attacker Sessions
        </CardTitle>
        <CardDescription>
          Select a session to view detailed ML analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground">
              Showing {sessions.length} of {totalSessions} sessions
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Source IP</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Timestamp
                    </div>
                  </TableHead>
                  <TableHead>Commands</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.session_id}>
                    <TableCell className="font-medium">{session.session_id}</TableCell>
                    <TableCell>{session.src_ip}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(session.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {countCommands(session)} commands
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {session.duration ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/sessions/${session.session_id}`}>
                        <Button variant="outline" size="sm">
                          Analyze
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No sessions found</h3>
            <p className="text-muted-foreground">
              No active or historical sessions have been recorded yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Terminal, 
  AlertTriangle, 
  Activity, 
  Download,
  Filter 
} from "lucide-react";
import { fetchSessionsData, Session } from "@/services/api";

export function CommandAnalysis() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCommands, setFilteredCommands] = useState<CommandEntry[]>([]);
  const [totalCommands, setTotalCommands] = useState(0);
  const { toast } = useToast();

  // Interface for processed command entries
  interface CommandEntry {
    command: string;
    session_id: string;
    src_ip: string;
    timestamp: string;
    ml_category: string;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSessionsData(1, 50); // Get more sessions for analysis
        setSessions(data.sessions);
        
        // Extract and process all commands
        const commands: CommandEntry[] = [];
        data.sessions.forEach(session => {
          session.events.forEach(event => {
            if (event.message?.includes("Command execution") || event.ml_output) {
              // Extract command from message
              const commandMatch = event.message?.match(/Command execution: (.+)/) || ["", ""];
              const command = commandMatch[1];
              
              if (command) {
                commands.push({
                  command,
                  session_id: session.session_id,
                  src_ip: session.src_ip,
                  timestamp: event.timestamp,
                  ml_category: event.ml_output || "Unknown"
                });
              }
            }
          });
        });
        
        setFilteredCommands(commands);
        setTotalCommands(commands.length);
      } catch (error) {
        console.error("Failed to fetch command data:", error);
        toast({
          title: "Error",
          description: "Failed to load command data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Reset to all commands if search is cleared
      const allCommands: CommandEntry[] = [];
      sessions.forEach(session => {
        session.events.forEach(event => {
          if (event.message?.includes("Command execution") || event.ml_output) {
            const commandMatch = event.message?.match(/Command execution: (.+)/) || ["", ""];
            const command = commandMatch[1];
            
            if (command) {
              allCommands.push({
                command,
                session_id: session.session_id,
                src_ip: session.src_ip,
                timestamp: event.timestamp,
                ml_category: event.ml_output || "Unknown"
              });
            }
          }
        });
      });
      
      setFilteredCommands(allCommands);
      return;
    }
    
    // Filter commands based on search term
    const commands: CommandEntry[] = [];
    sessions.forEach(session => {
      session.events.forEach(event => {
        if (event.message?.includes("Command execution") || event.ml_output) {
          const commandMatch = event.message?.match(/Command execution: (.+)/) || ["", ""];
          const command = commandMatch[1];
          
          if (command && (
            command.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.src_ip.includes(searchTerm) ||
            (event.ml_output && event.ml_output.toLowerCase().includes(searchTerm.toLowerCase()))
          )) {
            commands.push({
              command,
              session_id: session.session_id,
              src_ip: session.src_ip,
              timestamp: event.timestamp,
              ml_category: event.ml_output || "Unknown"
            });
          }
        }
      });
    });
    
    setFilteredCommands(commands);
  }, [searchTerm, sessions]);

  // Filter by ML category
  const filterByCategory = (category: string) => {
    if (category === "all") {
      const allCommands: CommandEntry[] = [];
      sessions.forEach(session => {
        session.events.forEach(event => {
          if (event.message?.includes("Command execution") || event.ml_output) {
            const commandMatch = event.message?.match(/Command execution: (.+)/) || ["", ""];
            const command = commandMatch[1];
            
            if (command) {
              allCommands.push({
                command,
                session_id: session.session_id,
                src_ip: session.src_ip,
                timestamp: event.timestamp,
                ml_category: event.ml_output || "Unknown"
              });
            }
          }
        });
      });
      
      setFilteredCommands(allCommands);
      return;
    }
    
    // Filter commands by ML category
    const commands: CommandEntry[] = [];
    sessions.forEach(session => {
      session.events.forEach(event => {
        if (event.ml_output === category) {
          const commandMatch = event.message?.match(/Command execution: (.+)/) || ["", ""];
          const command = commandMatch[1];
          
          if (command) {
            commands.push({
              command,
              session_id: session.session_id,
              src_ip: session.src_ip,
              timestamp: event.timestamp,
              ml_category: event.ml_output
            });
          }
        }
      });
    });
    
    setFilteredCommands(commands);
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Export commands as CSV
  const exportCommands = () => {
    const csvContent = [
      ["Command", "Source IP", "Session ID", "Timestamp", "ML Category"],
      ...filteredCommands.map(cmd => [
        cmd.command,
        cmd.src_ip,
        cmd.session_id,
        cmd.timestamp,
        cmd.ml_category
      ])
    ]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cowrie-commands-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export complete",
      description: `Exported ${filteredCommands.length} commands to CSV`
    });
  };

  // Get badge color based on ML category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "System Info": return "bg-cowrie-blue";
      case "Navigation": return "bg-cowrie-indigo";
      case "Network Scan": return "bg-cowrie-amber";
      case "User Enumeration": return "bg-cowrie-red";
      default: return "bg-cowrie-gray";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Terminal className="h-5 w-5 mr-2" />
                Command Analysis
              </CardTitle>
              <CardDescription>
                ML classification of attacker commands
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search commands..."
                  className="pl-8 w-[240px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button variant="outline" size="icon" onClick={exportCommands}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all" onClick={() => filterByCategory("all")}>All Commands</TabsTrigger>
              <TabsTrigger value="system" onClick={() => filterByCategory("System Info")}>System Info</TabsTrigger>
              <TabsTrigger value="navigation" onClick={() => filterByCategory("Navigation")}>Navigation</TabsTrigger>
              <TabsTrigger value="network" onClick={() => filterByCategory("Network Scan")}>Network Scan</TabsTrigger>
              <TabsTrigger value="user" onClick={() => filterByCategory("User Enumeration")}>User Enumeration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="border rounded-lg overflow-hidden">
                <div className="border-b bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <div>
                    {filteredCommands.length} of {totalCommands} commands
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filtered by ML category</span>
                  </div>
                </div>
                
                {loading ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {filteredCommands.length > 0 ? (
                      filteredCommands.map((cmd, idx) => (
                        <div key={idx} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-mono text-sm whitespace-pre-wrap break-all bg-black/5 p-2 rounded">
                                {cmd.command}
                              </div>
                              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                                <span>Source: {cmd.src_ip}</span>
                                <span>•</span>
                                <span>Session: {cmd.session_id}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getCategoryColor(cmd.ml_category)}>
                                {cmd.ml_category}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(cmd.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No commands match your search criteria</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Other tabs will use the same content but with filtered data */}
            <TabsContent value="system" className="mt-0">
              {/* Same structure as 'all' tab */}
            </TabsContent>
            <TabsContent value="navigation" className="mt-0">
              {/* Same structure as 'all' tab */}
            </TabsContent>
            <TabsContent value="network" className="mt-0">
              {/* Same structure as 'all' tab */}
            </TabsContent>
            <TabsContent value="user" className="mt-0">
              {/* Same structure as 'all' tab */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* ML Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ML Analysis Insights</CardTitle>
          <CardDescription>
            Patterns detected in attacker commands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Activity className="h-5 w-5 mr-2 text-cowrie-blue" />
                <h3 className="font-medium">Command Sequence Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                The ML system analyzes command sequences to identify attacker
                patterns. Common sequences include system information gathering
                followed by user enumeration, indicating reconnaissance behavior.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 mr-2 text-cowrie-amber" />
                <h3 className="font-medium">Threat Level Determination</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Commands are analyzed for malicious intent based on their potential
                impact. Network scanning and payload downloading commands are
                assigned higher threat scores by the classification model.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

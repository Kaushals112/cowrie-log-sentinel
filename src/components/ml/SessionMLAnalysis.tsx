
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { 
  fetchSessionMLData, 
  SessionMLAnalysisResponse,
  fetchSession,
  Session
} from "@/services/api";
import { ArrowLeft, Clock, Terminal, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export function SessionMLAnalysis() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<SessionMLAnalysisResponse | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) return;
      
      try {
        setLoading(true);
        const [mlData, sessionData] = await Promise.all([
          fetchSessionMLData(sessionId),
          fetchSession(sessionId)
        ]);
        
        setData(mlData);
        setSession(sessionData);
      } catch (error) {
        console.error("Failed to fetch session ML data:", error);
        toast({
          title: "Error",
          description: "Failed to load session ML analysis",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, toast]);

  // Format category data for pie chart
  const pieChartData = data
    ? Object.entries(data.command_categories).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  // Colors for the pie chart
  const COLORS = ["#0EA5E9", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981"];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Export commands as CSV
  const exportCommands = () => {
    if (!data || !data.commands.length) return;
    
    const csvContent = [
      ["Command", "ML Category", "Timestamp"],
      ...data.commands.map(cmd => [
        cmd.command,
        cmd.ml_output,
        cmd.timestamp
      ])
    ]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `session-${sessionId}-commands.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export complete",
      description: `Exported ${data.commands.length} commands to CSV`
    });
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "System Info": return "bg-[#0EA5E9]";
      case "Navigation": return "bg-[#8B5CF6]";
      case "Network Scan": return "bg-[#F59E0B]";
      case "User Enumeration": return "bg-[#EF4444]";
      default: return "bg-slate-500";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4">
        <Link to="/sessions">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-medium">
          Session Analysis
          {session && <span className="text-sm font-normal ml-2 text-muted-foreground">{session.session_id}</span>}
        </h1>
      </div>

      {/* Session info */}
      {session && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Source IP</span>
                <span className="font-medium">{session.src_ip}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Timestamp</span>
                <span className="font-medium">{formatDate(session.timestamp)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-medium">{session.duration || "Active"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Command Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Command Categories</CardTitle>
          <CardDescription>
            ML classification breakdown for this session
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {loading ? (
            <div className="h-[300px] bg-muted animate-pulse rounded-md" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} commands`, 'Count']} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {!loading && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {pieChartData.map((category, index) => (
                <div key={category.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">
                    {category.name}: {category.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Command List */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Terminal className="h-5 w-5 mr-2" />
                Command Sequence
              </CardTitle>
              <CardDescription>
                Chronological list of commands with ML classifications
              </CardDescription>
            </div>
            <Button variant="outline" onClick={exportCommands} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Command</TableHead>
                    <TableHead>ML Classification</TableHead>
                    <TableHead>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Timestamp
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.commands && data.commands.length > 0 ? (
                    data.commands.map((cmd, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-sm whitespace-pre-wrap break-all">
                          {cmd.command}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(cmd.ml_output)}>
                            {cmd.ml_output}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(cmd.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                        No commands recorded for this session
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Command Analysis */}
      <Tabs defaultValue="timeline" className="mt-8">
        <TabsList>
          <TabsTrigger value="timeline">Command Timeline</TabsTrigger>
          <TabsTrigger value="distribution">Command Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Command Timeline</CardTitle>
              <CardDescription>
                Chronological sequence of commands executed during this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] bg-muted animate-pulse rounded-md" />
              ) : data?.commands && data.commands.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.commands.map((cmd, index) => ({
                        id: index,
                        command: cmd.command,
                        value: 1,
                        category: cmd.ml_output
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="id" 
                        tick={{ fontSize: 12 }} 
                        tickFormatter={(value) => `${value + 1}`}
                        label={{ value: 'Command Sequence', position: 'bottom', offset: 0 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} hide />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-sm">
                              <p className="font-medium mb-1">{data.command}</p>
                              <Badge className={getCategoryColor(data.category)}>
                                {data.category}
                              </Badge>
                            </div>
                          );
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                        name="Command"
                      >
                        {data.commands.map((entry, index) => {
                          const color = 
                            entry.ml_output === "System Info" ? "#0EA5E9" :
                            entry.ml_output === "Navigation" ? "#8B5CF6" :
                            entry.ml_output === "Network Scan" ? "#F59E0B" :
                            entry.ml_output === "User Enumeration" ? "#EF4444" : "#9ca3af";
                          
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No command data available for visualization
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Command Distribution</CardTitle>
              <CardDescription>
                Breakdown of command types by frequency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] bg-muted animate-pulse rounded-md" />
              ) : data?.commands && data.commands.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(data.command_categories).map(([name, value]) => ({
                        name,
                        value
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]}
                        name="Count"
                      >
                        {Object.entries(data.command_categories).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No command data available for visualization
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

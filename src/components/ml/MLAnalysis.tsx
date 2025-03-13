
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  LineChart,
  Line,
} from "recharts";
import { fetchMLAnalysisData, MLAnalysisResponse } from "@/services/api";

export function MLAnalysis() {
  const [data, setData] = useState<MLAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analysisData = await fetchMLAnalysisData();
        setData(analysisData);
      } catch (error) {
        console.error("Failed to fetch ML analysis data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format category data for pie chart
  const pieChartData = data
    ? Object.entries(data.command_categories).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  // Colors for the pie chart
  const COLORS = ["#0EA5E9", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Command Categories Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Command Categories</CardTitle>
            <CardDescription>
              Distribution of commands by ML classification
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

        {/* Command Trend Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Command Trend</CardTitle>
            <CardDescription>
              ML classified commands over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {loading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-md" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data?.command_trend}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getMonth() + 1}/${d.getDate()}`;
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#0EA5E9"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Commands</CardTitle>
          <CardDescription>
            Most frequently executed commands by attackers
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {loading ? (
            <div className="h-[300px] bg-muted animate-pulse rounded-md" />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.top_commands}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 20,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="command"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                    name="Execution Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* ML Categories Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ML Classification Categories</CardTitle>
          <CardDescription>
            Understanding command classifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Badge className="bg-[#0EA5E9]">System Info</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Commands that gather system information such as uname, cat /etc/issue, or hardware details.
                Attackers use these to identify the target system.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Badge className="bg-[#8B5CF6]">Navigation</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                File system navigation commands like ls, cd, pwd. These reveal
                attacker's exploration patterns through the honeypot.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Badge className="bg-[#F59E0B]">Network Scan</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Network reconnaissance commands including ping, netstat, and port scanning.
                Indicates attackers searching for additional targets.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Badge className="bg-[#EF4444]">User Enumeration</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Commands that list user accounts or attempt privilege escalation
                such as cat /etc/passwd or sudo attempts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

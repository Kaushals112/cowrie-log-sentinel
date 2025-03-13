
import { SessionsList } from "@/components/sessions/SessionsList";

export default function SessionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-medium mb-6">Honeypot Sessions</h1>
      <SessionsList />
    </div>
  );
}

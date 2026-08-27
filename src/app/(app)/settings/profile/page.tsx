import { Button } from "@/components/ui/button";

export default function SettingsProfilePage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full border border-hairline bg-elevated" />
        <Button variant="secondary" size="sm">
          Change avatar
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-text-muted">Display name</label>
        <input
          defaultValue="Tioluwanimi Adeagbo"
          className="rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-ember"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-text-muted">Bio</label>
        <textarea
          rows={3}
          placeholder="Backend engineer in progress."
          className="rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-ember"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-text-muted">Goal</label>
        <select className="rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:border-ember">
          <option>Backend Developer</option>
          <option>Full-Stack Developer</option>
          <option>Software Engineer</option>
          <option>Interview Preparation</option>
          <option>System Design</option>
          <option>Professional Upskilling</option>
        </select>
      </div>

      <Button variant="primary">Save changes</Button>
    </div>
  );
}

import { Cake, Heart } from "lucide-react";

interface Birthday {
  id: string;
  woman_name: string | null;
  man_name: string | null;
  birthday_date: string;
  birthday_type: string;
}

interface BirthdayCardProps {
  birthdays: Birthday[];
  title?: string;
}

export default function BirthdayCard({ birthdays, title = "Aniversários do Mês" }: BirthdayCardProps) {
  if (birthdays.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
  };

  const getName = (birthday: Birthday) => {
    if (birthday.birthday_type === "wedding") {
      const names = [birthday.man_name, birthday.woman_name].filter(Boolean);
      return names.join(" & ");
    }
    return birthday.woman_name || birthday.man_name || "";
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
          <Cake className="w-5 h-5 text-primary-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      </div>

      <div className="space-y-3">
        {birthdays.map((birthday) => (
          <div
            key={birthday.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {birthday.birthday_type === "wedding" ? (
                <Heart className="w-4 h-4 text-primary" />
              ) : (
                <Cake className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{getName(birthday)}</p>
              <p className="text-sm text-muted-foreground">{formatDate(birthday.birthday_date)}</p>
            </div>
            {birthday.birthday_type === "wedding" && (
              <span className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-700">
                Casamento
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

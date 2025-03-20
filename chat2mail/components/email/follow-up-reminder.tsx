import { useState } from 'react';
import { CalendarIcon, Clock, Bell, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Reminder = {
  id: string;
  emailSubject: string;
  recipient: string;
  date: Date;
  time: string;
  active: boolean;
};

type FollowUpReminderProps = {
  emailSubject: string;
  recipient: string;
  onReminderSet: (reminder: Omit<Reminder, 'id'>) => void;
};

export function FollowUpReminder({ emailSubject, recipient, onReminderSet }: FollowUpReminderProps) {
  const [date, setDate] = useState<Date | undefined>(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // Default to 3 days from now
  const [time, setTime] = useState<string>("09:00");
  const [open, setOpen] = useState(false);
  
  const handleSetReminder = () => {
    if (date) {
      onReminderSet({
        emailSubject,
        recipient,
        date,
        time,
        active: true
      });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 text-xs"
        >
          <Bell className="h-3.5 w-3.5" />
          Set Follow-up
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Set Follow-up Reminder</h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="grid gap-1">
              <Label htmlFor="date" className="text-xs">Reminder Date</Label>
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal text-xs",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid gap-1">
              <Label htmlFor="time" className="text-xs">Reminder Time</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-gray-500" />
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="17:00">5:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={handleSetReminder} 
              className="w-full text-xs"
              disabled={!date}
            >
              Set Reminder
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type ReminderListProps = {
  reminders: Reminder[];
  onToggleReminder: (id: string, active: boolean) => void;
  onDeleteReminder: (id: string) => void;
};

export function ReminderList({ reminders, onToggleReminder, onDeleteReminder }: ReminderListProps) {
  if (reminders.length === 0) {
    return null;
  }
  
  return (
    <Card className="p-4 border border-gray-100 dark:border-gray-800 shadow-sm bg-white/95 dark:bg-gray-800/95">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-medium">Follow-up Reminders</h3>
        </div>
        
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div 
              key={reminder.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-md border",
                reminder.active 
                  ? "border-purple-100 bg-purple-50 dark:border-purple-900 dark:bg-purple-900/20" 
                  : "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50 opacity-70"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium truncate max-w-[180px]">
                    {reminder.emailSubject || "Email to " + reminder.recipient}
                  </span>
                  {!reminder.active && (
                    <Badge variant="outline" className="text-[10px] py-0 h-4 bg-gray-100 dark:bg-gray-800">
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <CalendarIcon className="h-3 w-3" />
                  <span>{format(reminder.date, "PPP")}</span>
                  <Clock className="h-3 w-3 ml-1" />
                  <span>
                    {reminder.time.split(':')[0] > "12" 
                      ? `${parseInt(reminder.time.split(':')[0]) - 12}:${reminder.time.split(':')[1]} PM`
                      : `${reminder.time} AM`}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1">
                  <Switch 
                    id={`reminder-${reminder.id}`}
                    checked={reminder.active}
                    onCheckedChange={(checked) => onToggleReminder(reminder.id, checked)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:text-red-500"
                  onClick={() => onDeleteReminder(reminder.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

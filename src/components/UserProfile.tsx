import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User } from 'lucide-react';

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign Out Failed',
        description: error.message,
      });
    } else {
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-card/50 border border-border/50">
      <div className="flex items-center gap-2 flex-1">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-foreground">
          {user.user_metadata?.display_name || user.email}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-3 w-3" />
        Sign Out
      </Button>
    </div>
  );
};
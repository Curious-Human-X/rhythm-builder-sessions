import { IntervalTimer } from '@/components/IntervalTimer';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[image:var(--gradient-bg)] flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[image:var(--gradient-bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-border/50 text-center" style={{ boxShadow: 'var(--shadow-elevated)' }}>
            <h1 className="text-3xl font-bold text-foreground mb-4">Rhythm Builder</h1>
            <p className="text-muted-foreground mb-6">
              Create personalized interval training sessions with custom exercises and timing.
            </p>
            <Link to="/auth">
              <Button className="w-full">
                Sign In to Get Started
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return <IntervalTimer />;
};

export default Index;

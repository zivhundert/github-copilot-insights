import { Shield } from 'lucide-react';

export const PrivacyFooter = () => {
  return (
    <footer className="mt-16 py-6 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>
            Anonymous usage data is collected to improve the experience. No personal information is stored or shared.
          </span>
        </div>
      </div>
    </footer>
  );
};

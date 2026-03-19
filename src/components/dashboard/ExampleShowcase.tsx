import { Download, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analytics } from '@/services/analytics';

export const ExampleShowcase = () => {
  const handleDownloadExample = () => {
    analytics.trackExport('image');
    const link = document.createElement('a');
    link.href = '/fullreport.png';
    link.download = 'copilot-full-report-example.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6 mb-8">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          See what your dashboard could look like
        </h3>
        <p className="text-sm text-muted-foreground">
          Real results from a mid-size engineering team using GitHub Copilot
        </p>
      </div>

      <div className="rounded-lg border overflow-hidden bg-card">
        <div className="relative">
          <img
            src="/example.png"
            alt="Dashboard preview"
            className="w-full"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-semibold text-foreground">107K+</div>
          <div className="text-xs text-muted-foreground">Lines accepted</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-foreground">$59K+</div>
          <div className="text-xs text-muted-foreground">Cost savings</div>
        </div>
        <div>
          <div className="text-2xl font-semibold text-foreground">480%</div>
          <div className="text-xs text-muted-foreground">ROI</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadExample}
        >
          <Download className="w-3.5 h-3.5 mr-2" />
          Download full report
        </Button>
        <Button
          size="sm"
          onClick={() => {
            const uploadSection = document.querySelector('[data-upload-section]');
            if (uploadSection) {
              uploadSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <ArrowDown className="w-3.5 h-3.5 mr-2" />
          Upload your data
        </Button>
      </div>
    </div>
  );
};

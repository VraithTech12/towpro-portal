import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, ArrowLeft, Loader2, CheckCircle, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import apexLogo from '@/assets/apex-logo.png';

const Apply = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    characterName: '',
    discordName: '',
    timezone: '',
    hoursPerWeek: '',
    whyJoin: '',
    experience: '',
    scenarioVehicleBreakdown: '',
    scenarioDifficultCustomer: '',
    scenarioEnhanceRoleplay: '',
    ruleBreakResponse: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          character_name: formData.characterName,
          discord_name: formData.discordName,
          timezone: formData.timezone,
          hours_per_week: formData.hoursPerWeek,
          why_join: formData.whyJoin,
          experience: formData.experience,
          scenario_vehicle_breakdown: formData.scenarioVehicleBreakdown,
          scenario_difficult_customer: formData.scenarioDifficultCustomer,
          scenario_enhance_roleplay: formData.scenarioEnhanceRoleplay,
          rule_break_response: formData.ruleBreakResponse,
        })
        .select('application_id')
        .single();

      if (error) throw error;

      setApplicationId(data.application_id);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  const copyApplicationId = () => {
    if (applicationId) {
      navigator.clipboard.writeText(applicationId);
      toast.success('Application ID copied to clipboard!');
    }
  };

  if (applicationId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-success mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Application Submitted!</h1>
          <p className="text-muted-foreground">
            Your application has been received. Save your Application ID to track your status.
          </p>
          
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Your Application ID</p>
            <div className="flex items-center gap-2 justify-center">
              <span className="text-2xl font-mono font-bold text-primary">{applicationId}</span>
              <Button variant="ghost" size="icon" onClick={copyApplicationId}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this ID to check your application status at any time.
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/check-status" className="block">
              <Button className="w-full">Check Application Status</Button>
            </Link>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <img src={apexLogo} alt="Apex Towing" className="h-12 mx-auto" />
          <FileText className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Towing Application</h1>
          <p className="text-muted-foreground">
            Complete the form below to apply to Apex Towing.
          </p>
        </div>

        {/* Application Form */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Application Form</h2>
            <p className="text-sm text-muted-foreground">All fields are required. Please be truthful and concise.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="characterName">Your Character Name</Label>
                <Input
                  id="characterName"
                  value={formData.characterName}
                  onChange={(e) => handleInputChange('characterName', e.target.value)}
                  placeholder="Your character name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discordName">Full Discord Name</Label>
                <Input
                  id="discordName"
                  value={formData.discordName}
                  onChange={(e) => handleInputChange('discordName', e.target.value)}
                  placeholder="Your Discord username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">What Timezone will you be active in?</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EU">EU (Europe)</SelectItem>
                    <SelectItem value="NA">NA (North America)</SelectItem>
                    <SelectItem value="AU">AU (Australia)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hoursPerWeek">How many hours per week can you dedicate to towing?</Label>
                <Select value={formData.hoursPerWeek} onValueChange={(value) => handleInputChange('hoursPerWeek', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours per week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 hours</SelectItem>
                    <SelectItem value="5-10">5-10 hours</SelectItem>
                    <SelectItem value="10-20">10-20 hours</SelectItem>
                    <SelectItem value="20+">20+ hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Essay Questions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whyJoin">Why do you want to join Apex Towing? <span className="text-destructive">*</span></Label>
                <Textarea
                  id="whyJoin"
                  value={formData.whyJoin}
                  onChange={(e) => handleInputChange('whyJoin', e.target.value)}
                  placeholder="Please provide a detailed response..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">What experience do you have in towing or similar services? <span className="text-destructive">*</span></Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Please provide a detailed response..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scenarioVehicleBreakdown">A customer calls saying their vehicle broke down on the highway. What do you do? <span className="text-destructive">*</span></Label>
                <Textarea
                  id="scenarioVehicleBreakdown"
                  value={formData.scenarioVehicleBreakdown}
                  onChange={(e) => handleInputChange('scenarioVehicleBreakdown', e.target.value)}
                  placeholder="Please provide a detailed response..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scenarioDifficultCustomer">A customer is being aggressive and difficult. They are unhappy with the service. What do you do? <span className="text-destructive">*</span></Label>
                <Textarea
                  id="scenarioDifficultCustomer"
                  value={formData.scenarioDifficultCustomer}
                  onChange={(e) => handleInputChange('scenarioDifficultCustomer', e.target.value)}
                  placeholder="Please provide a detailed response..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scenarioEnhanceRoleplay">Explain a time where you positively contributed to and enhanced a roleplay scenario? <span className="text-destructive">*</span></Label>
                <Textarea
                  id="scenarioEnhanceRoleplay"
                  value={formData.scenarioEnhanceRoleplay}
                  onChange={(e) => handleInputChange('scenarioEnhanceRoleplay', e.target.value)}
                  placeholder="Please provide a detailed response..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruleBreakResponse">A player has broken a server rule in front of you, what do you do?</Label>
                <Select value={formData.ruleBreakResponse} onValueChange={(value) => handleInputChange('ruleBreakResponse', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your response" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Report them to staff</SelectItem>
                    <SelectItem value="ignore">Ignore it and continue roleplay</SelectItem>
                    <SelectItem value="confront">Confront them in character</SelectItem>
                    <SelectItem value="leave">Leave the situation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Application
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link to="/login" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Apply;
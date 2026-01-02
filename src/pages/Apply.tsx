import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FileText, ArrowLeft, Loader2, CheckCircle, Copy, User, MessageSquare, Clock, MapPin, Truck, Shield, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

// Input validation schema
const applicationSchema = z.object({
  characterName: z.string().trim().min(2, 'Character name must be at least 2 characters').max(50, 'Character name must be less than 50 characters'),
  discordName: z.string().trim().min(2, 'Discord name must be at least 2 characters').max(50, 'Discord name must be less than 50 characters'),
  timezone: z.enum(['EU', 'NA', 'AU', 'Other'], { required_error: 'Please select a timezone' }),
  hoursPerWeek: z.enum(['1-5', '5-10', '10-20', '20+'], { required_error: 'Please select hours per week' }),
  whyJoin: z.string().trim().min(20, 'Please provide at least 20 characters').max(2000, 'Response must be less than 2000 characters'),
  experience: z.string().trim().min(20, 'Please provide at least 20 characters').max(2000, 'Response must be less than 2000 characters'),
  scenarioVehicleBreakdown: z.string().trim().min(20, 'Please provide at least 20 characters').max(2000, 'Response must be less than 2000 characters'),
  scenarioDifficultCustomer: z.string().trim().min(20, 'Please provide at least 20 characters').max(2000, 'Response must be less than 2000 characters'),
  scenarioEnhanceRoleplay: z.string().trim().min(20, 'Please provide at least 20 characters').max(2000, 'Response must be less than 2000 characters'),
  ruleBreakResponse: z.enum(['report', 'ignore', 'confront', 'leave'], { required_error: 'Please select a response' }),
});

const Apply = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const completionPercentage = useMemo(() => {
    const fields = Object.values(formData);
    const filledFields = fields.filter(value => value.trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate all inputs
    const result = applicationSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const validData = result.data;
      const { data, error } = await supabase
        .from('applications')
        .insert({
          character_name: validData.characterName,
          discord_name: validData.discordName,
          timezone: validData.timezone,
          hours_per_week: validData.hoursPerWeek,
          why_join: validData.whyJoin,
          experience: validData.experience,
          scenario_vehicle_breakdown: validData.scenarioVehicleBreakdown,
          scenario_difficult_customer: validData.scenarioDifficultCustomer,
          scenario_enhance_roleplay: validData.scenarioEnhanceRoleplay,
          rule_break_response: validData.ruleBreakResponse,
        })
        .select('application_id')
        .single();

      if (error) throw error;

      setApplicationId(data.application_id);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting application');
      toast.error('Failed to submit application. Please try again.');
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md text-center space-y-6 relative z-10 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Application Submitted!</h1>
          <p className="text-muted-foreground">
            Your application has been received. Save your Application ID to track your status.
          </p>
          
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 space-y-4 shadow-xl">
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Your Application ID</p>
            <div className="flex items-center gap-3 justify-center bg-primary/5 rounded-xl p-4">
              <span className="text-2xl font-mono font-bold text-primary tracking-wider">{applicationId}</span>
              <Button variant="ghost" size="icon" onClick={copyApplicationId} className="hover:bg-primary/10">
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this ID to check your application status at any time.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Link to="/check-status" className="block">
              <Button className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20">
                Check Application Status
              </Button>
            </Link>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full h-12 text-base font-medium">
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/10">
              <Truck className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground tracking-tight">Join Our Team</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Complete the application below to join Apex Towing
              </p>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Application Form</h2>
                  <p className="text-sm text-muted-foreground">All fields are required. Please be truthful and concise.</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-8 pt-6 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Form Completion</span>
                <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-medium text-primary uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  Basic Information
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="characterName" className="text-sm font-medium">Character Name</Label>
                    <Input
                      id="characterName"
                      value={formData.characterName}
                      onChange={(e) => handleInputChange('characterName', e.target.value)}
                      placeholder="Enter your character name"
                      maxLength={50}
                      className={`h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-colors ${errors.characterName ? 'border-destructive' : ''}`}
                      required
                    />
                    {errors.characterName && <p className="text-xs text-destructive">{errors.characterName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discordName" className="text-sm font-medium">Discord Username</Label>
                    <Input
                      id="discordName"
                      value={formData.discordName}
                      onChange={(e) => handleInputChange('discordName', e.target.value)}
                      placeholder="Your Discord username"
                      maxLength={50}
                      className={`h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-colors ${errors.discordName ? 'border-destructive' : ''}`}
                      required
                    />
                    {errors.discordName && <p className="text-xs text-destructive">{errors.discordName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      Active Timezone
                    </Label>
                    <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)} required>
                      <SelectTrigger className={`h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-colors ${errors.timezone ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EU">EU (Europe)</SelectItem>
                        <SelectItem value="NA">NA (North America)</SelectItem>
                        <SelectItem value="AU">AU (Australia)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.timezone && <p className="text-xs text-destructive">{errors.timezone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hoursPerWeek" className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      Weekly Availability
                    </Label>
                    <Select value={formData.hoursPerWeek} onValueChange={(value) => handleInputChange('hoursPerWeek', value)} required>
                      <SelectTrigger className={`h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-colors ${errors.hoursPerWeek ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Hours per week" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 hours</SelectItem>
                        <SelectItem value="5-10">5-10 hours</SelectItem>
                        <SelectItem value="10-20">10-20 hours</SelectItem>
                        <SelectItem value="20+">20+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.hoursPerWeek && <p className="text-xs text-destructive">{errors.hoursPerWeek}</p>}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Motivation Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-medium text-primary uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Motivation & Experience
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="whyJoin" className="text-sm font-medium">
                      Why do you want to join Apex Towing? <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="whyJoin"
                      value={formData.whyJoin}
                      onChange={(e) => handleInputChange('whyJoin', e.target.value)}
                      placeholder="Tell us what motivates you to join our team..."
                      maxLength={2000}
                      className={`min-h-[120px] bg-background/50 border-border/50 focus:border-primary/50 transition-colors resize-none ${errors.whyJoin ? 'border-destructive' : ''}`}
                      required
                    />
                    {errors.whyJoin && <p className="text-xs text-destructive">{errors.whyJoin}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-sm font-medium">
                      What experience do you have in towing or similar services? <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="Describe your relevant experience..."
                      maxLength={2000}
                      className={`min-h-[120px] bg-background/50 border-border/50 focus:border-primary/50 transition-colors resize-none ${errors.experience ? 'border-destructive' : ''}`}
                      required
                    />
                    {errors.experience && <p className="text-xs text-destructive">{errors.experience}</p>}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Scenario Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-medium text-primary uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4" />
                  Scenario Questions
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border/30">
                    <Label htmlFor="scenarioVehicleBreakdown" className="text-sm font-medium">
                      A customer calls saying their vehicle broke down on the highway. What do you do? <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="scenarioVehicleBreakdown"
                      value={formData.scenarioVehicleBreakdown}
                      onChange={(e) => handleInputChange('scenarioVehicleBreakdown', e.target.value)}
                      placeholder="Describe how you would handle this situation..."
                      maxLength={2000}
                      className={`min-h-[100px] bg-background/80 border-border/50 focus:border-primary/50 transition-colors resize-none ${errors.scenarioVehicleBreakdown ? 'border-destructive' : ''}`}
                      required
                    />
                    {errors.scenarioVehicleBreakdown && <p className="text-xs text-destructive">{errors.scenarioVehicleBreakdown}</p>}
                  </div>

                  <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border/30">
                    <Label htmlFor="scenarioDifficultCustomer" className="text-sm font-medium">
                      A customer is being aggressive and difficult. They are unhappy with the service. What do you do? <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="scenarioDifficultCustomer"
                      value={formData.scenarioDifficultCustomer}
                      onChange={(e) => handleInputChange('scenarioDifficultCustomer', e.target.value)}
                      placeholder="Describe how you would de-escalate this situation..."
                      maxLength={2000}
                      className={`min-h-[100px] bg-background/80 border-border/50 focus:border-primary/50 transition-colors resize-none ${errors.scenarioDifficultCustomer ? 'border-destructive' : ''}`}
                      required
                    />
                    {errors.scenarioDifficultCustomer && <p className="text-xs text-destructive">{errors.scenarioDifficultCustomer}</p>}
                  </div>

                  <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border/30">
                    <Label htmlFor="scenarioEnhanceRoleplay" className="text-sm font-medium">
                      Explain a time where you positively contributed to and enhanced a roleplay scenario? <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="scenarioEnhanceRoleplay"
                      value={formData.scenarioEnhanceRoleplay}
                      onChange={(e) => handleInputChange('scenarioEnhanceRoleplay', e.target.value)}
                      placeholder="Share your roleplay experience..."
                      maxLength={2000}
                      className={`min-h-[100px] bg-background/80 border-border/50 focus:border-primary/50 transition-colors resize-none ${errors.scenarioEnhanceRoleplay ? 'border-destructive' : ''}`}
                      required
                    />
                    {errors.scenarioEnhanceRoleplay && <p className="text-xs text-destructive">{errors.scenarioEnhanceRoleplay}</p>}
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Final Question */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm font-medium text-primary uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  Server Rules
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ruleBreakResponse" className="text-sm font-medium">
                    A player has broken a server rule in front of you, what do you do?
                  </Label>
                  <Select value={formData.ruleBreakResponse} onValueChange={(value) => handleInputChange('ruleBreakResponse', value)} required>
                    <SelectTrigger className={`h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-colors ${errors.ruleBreakResponse ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select your response" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="report">Report them to staff</SelectItem>
                      <SelectItem value="ignore">Ignore it and continue roleplay</SelectItem>
                      <SelectItem value="confront">Confront them in character</SelectItem>
                      <SelectItem value="leave">Leave the situation</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.ruleBreakResponse && <p className="text-xs text-destructive">{errors.ruleBreakResponse}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Back Link */}
          <div className="text-center pb-8">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Apply;

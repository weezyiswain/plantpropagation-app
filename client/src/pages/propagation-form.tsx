import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Plant, InsertPropagationRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPropagationRequestSchema } from "@shared/schema";
import { z } from "zod";
import { Sprout, ArrowLeft, Info, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { autoDetectUSDAZone } from "@/lib/zone-detection";

const formSchema = insertPropagationRequestSchema.extend({
  plantId: z.string().min(1, "Plant is required"),
  zone: z.string().min(1, "Growing zone is required"),
  maturity: z.string().min(1, "Plant maturity is required"),
  environment: z.string().min(1, "Environment is required"),
});

type FormValues = z.infer<typeof formSchema>;

const zones = [
  { value: "1a", label: "Zone 1a (-60°F to -55°F)" },
  { value: "1b", label: "Zone 1b (-55°F to -50°F)" },
  { value: "2a", label: "Zone 2a (-50°F to -45°F)" },
  { value: "2b", label: "Zone 2b (-45°F to -40°F)" },
  { value: "3a", label: "Zone 3a (-40°F to -35°F)" },
  { value: "3b", label: "Zone 3b (-35°F to -30°F)" },
  { value: "4a", label: "Zone 4a (-30°F to -25°F)" },
  { value: "4b", label: "Zone 4b (-25°F to -20°F)" },
  { value: "5a", label: "Zone 5a (-20°F to -15°F)" },
  { value: "5b", label: "Zone 5b (-15°F to -10°F)" },
  { value: "6a", label: "Zone 6a (-10°F to -5°F)" },
  { value: "6b", label: "Zone 6b (-5°F to 0°F)" },
  { value: "7a", label: "Zone 7a (0°F to 5°F)" },
  { value: "7b", label: "Zone 7b (5°F to 10°F)" },
  { value: "8a", label: "Zone 8a (10°F to 15°F)" },
  { value: "8b", label: "Zone 8b (15°F to 20°F)" },
  { value: "9a", label: "Zone 9a (20°F to 25°F)" },
  { value: "9b", label: "Zone 9b (25°F to 30°F)" },
  { value: "10a", label: "Zone 10a (30°F to 35°F)" },
  { value: "10b", label: "Zone 10b (35°F to 40°F)" },
  { value: "11a", label: "Zone 11a (40°F to 45°F)" },
  { value: "11b", label: "Zone 11b (45°F to 50°F)" },
  { value: "12a", label: "Zone 12a (50°F to 55°F)" },
  { value: "12b", label: "Zone 12b (55°F to 60°F)" },
  { value: "13a", label: "Zone 13a (60°F to 65°F)" },
  { value: "13b", label: "Zone 13b (65°F to 70°F)" },
];

export default function PropagationForm() {
  const { plantId } = useParams<{ plantId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: plant, isLoading } = useQuery<Plant>({
    queryKey: ["/api/plants", plantId],
    enabled: !!plantId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plantId: plantId || "",
      zone: "",
      maturity: "",
      environment: "",
    },
  });

  // Set page title
  useEffect(() => {
    if (plant?.name) {
      document.title = `${plant.name} - Propagation Form`;
    } else {
      document.title = "Propagation Form";
    }
  }, [plant?.name]);

  // Auto-detect USDA zone on mount
  useEffect(() => {
    const detectZone = async () => {
      // Only auto-detect if zone field is empty
      if (form.getValues("zone")) {
        return;
      }

      const detectedZone = await autoDetectUSDAZone();
      
      if (detectedZone) {
        // API returns full zone strings (e.g., "6a") - use directly
        const matchingZone = zones.find(z => z.value === detectedZone);
        
        if (matchingZone) {
          form.setValue("zone", matchingZone.value);
          toast({
            title: "Zone Auto-Detected",
            description: `We've set your zone to ${matchingZone.label} based on your location. You can change this if needed.`,
          });
        } else {
          // Fallback: try prefix match if exact match fails
          const prefixMatch = zones.find(z => z.value.startsWith(detectedZone.charAt(0)));
          if (prefixMatch) {
            form.setValue("zone", prefixMatch.value);
            toast({
              title: "Zone Auto-Detected",
              description: `We've set your zone to ${prefixMatch.label} based on your location. You can change this if needed.`,
            });
          }
        }
      } else {
        // Silently fail - user can select manually
        console.log('[Form] Auto-detection unavailable, user can select zone manually');
      }
    };

    detectZone();
  }, []);

  const createRequestMutation = useMutation({
    mutationFn: async (data: InsertPropagationRequest) => {
      const res = await apiRequest("POST", "/api/propagation-requests", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/propagation-requests"] });
      toast({
        title: "Success!",
        description: "Your propagation guide has been generated.",
      });
      setLocation(`/results/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createRequestMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-40" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Plant not found</p>
            <Button onClick={() => setLocation("/")} className="mt-4">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" data-testid="link-home-logo">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sprout className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Plant Propagation</h1>
              </div>
            </Link>
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Form Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Tell Us About Your Growing Conditions
              </h3>
              <p className="text-muted-foreground">
                Help us provide the most accurate propagation timing for your specific situation.
              </p>
            </div>

            <Card className="shadow-lg">
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Selected Plant Display */}
                    <div className="bg-accent/20 rounded-lg p-4 flex items-center space-x-4">
                      {plant.imageUrl && (
                        <img
                          src={plant.imageUrl}
                          alt={plant.commonName}
                          className="w-16 h-16 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {plant.commonName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {plant.scientificName}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Plant Maturity */}
                      <FormField
                        control={form.control}
                        name="maturity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plant Maturity Level</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger data-testid="select-maturity">
                                  <SelectValue placeholder="Select maturity level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="seedling">Sprout (0-6 months)</SelectItem>
                                <SelectItem value="young">Young (6 months - 2 years)</SelectItem>
                                <SelectItem value="mature">Mature (2-5 years)</SelectItem>
                                <SelectItem value="established">Established (5+ years)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Growing Environment */}
                      <FormField
                        control={form.control}
                        name="environment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Growing Environment</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger data-testid="select-environment">
                                  <SelectValue placeholder="Select environment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="inside">Inside</SelectItem>
                                <SelectItem value="outside">Outside</SelectItem>
                                <SelectItem value="greenhouse">Greenhouse</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* USDA Growing Zone */}
                      <FormField
                        control={form.control}
                        name="zone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>USDA Growing Zone</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger data-testid="select-zone">
                                  <SelectValue placeholder="Select your zone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {zones.map((zone) => (
                                  <SelectItem key={zone.value} value={zone.value}>
                                    {zone.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              Don't know your zone?{" "}
                              <a
                                href="https://planthardiness.ars.usda.gov/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                                data-testid="link-zone-finder"
                              >
                                Find it here
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setLocation("/")}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createRequestMutation.isPending}
                        data-testid="button-submit-form"
                      >
                        {createRequestMutation.isPending
                          ? "Generating..."
                          : "Get My Propagation Guide"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

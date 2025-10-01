import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { PropagationRequest, Plant, InsertPropagationRequest } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sprout, Calendar, Scissors, Sun, Droplet, Leaf, AlertCircle, ArrowLeft, CheckCircle, MapPin } from "lucide-react";
import { calculatePropagationWindows, getRecommendedMethod } from "@/lib/propagation-calculator";
import { Skeleton } from "@/components/ui/skeleton";
import { AdPlaceholder } from "@/components/ad-placeholder";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const USDA_ZONES = [
  "1a", "1b", "2a", "2b", "3a", "3b", "4a", "4b", "5a", "5b",
  "6a", "6b", "7a", "7b", "8a", "8b", "9a", "9b", "10a", "10b",
  "11a", "11b", "12a", "12b", "13a", "13b"
];

export default function Results() {
  const { requestId } = useParams<{ requestId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: request, isLoading: requestLoading } = useQuery<PropagationRequest>({
    queryKey: ["/api/propagation-requests", requestId],
    enabled: !!requestId,
  });

  const { data: plant, isLoading: plantLoading } = useQuery<Plant>({
    queryKey: ["/api/plants", request?.plantId],
    enabled: !!request?.plantId,
  });

  const [selectedZone, setSelectedZone] = useState<string>(request?.zone || "");

  useEffect(() => {
    if (request?.zone) {
      setSelectedZone(request.zone);
    }
  }, [request?.zone]);

  const changeZoneMutation = useMutation({
    mutationFn: async (newZone: string) => {
      if (!request || !plant) return;
      const data: InsertPropagationRequest = {
        plantId: request.plantId,
        zone: newZone,
        maturity: request.maturity,
        environment: request.environment,
      };
      const res = await apiRequest("POST", "/api/propagation-requests", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/propagation-requests"] });
      setLocation(`/results/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change zone",
        variant: "destructive",
      });
    },
  });

  const handleZoneChange = (zone: string) => {
    setSelectedZone(zone);
    changeZoneMutation.mutate(zone);
  };

  const isLoading = requestLoading || plantLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-40" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-8">
            <Skeleton className="h-20 w-full" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!request || !plant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Results not found</p>
            <Button onClick={() => setLocation("/")} className="mt-4">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { primary, secondary, zoneInfo, adjustedSuccessRate } = calculatePropagationWindows(plant, request);
  const recommendedMethod = getRecommendedMethod(plant);
  const methodSteps = plant.propagationSteps[recommendedMethod] || [];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" data-testid="link-home-logo">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sprout className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PlantProp</h1>
                <p className="text-xs text-muted-foreground">Smart Propagation Guide</p>
              </div>
            </Link>
            
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              data-testid="button-back-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <CheckCircle className="h-4 w-4" />
                <span>Propagation Guide Generated</span>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                {plant.commonName} Propagation Guide
              </h3>
              
              {/* Zone Selector */}
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Customized for:</span>
                <Select value={selectedZone} onValueChange={handleZoneChange}>
                  <SelectTrigger className="w-[120px]" data-testid="select-zone-header">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {USDA_ZONES.map((zone) => (
                      <SelectItem key={zone} value={zone} data-testid={`zone-option-${zone}`}>
                        Zone {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Top Banner Ad */}
            <AdPlaceholder slot="results-top-banner" format="leaderboard" />
            <AdPlaceholder slot="results-top-mobile" format="mobile-banner" />

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Propagation Steps */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <Scissors className="text-secondary-foreground h-5 w-5" />
                      </div>
                      <h4 className="text-xl font-semibold text-foreground">
                        Recommended Steps
                      </h4>
                    </div>

                    {plant.methods.length > 1 ? (
                      <Tabs defaultValue={recommendedMethod}>
                        <TabsList>
                          {plant.methods.map((method) => (
                            <TabsTrigger key={method} value={method} className="capitalize">
                              {method.replace("-", " ")}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {plant.methods.map((method) => {
                          const steps = plant.propagationSteps[method] || [];
                          return (
                            <TabsContent key={method} value={method} className="space-y-6 mt-6">
                              {steps.map((stepData: any, index: number) => (
                                <div key={index} className="flex space-x-4">
                                  <div className="flex-shrink-0 w-8 h-8 step-number rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                                    {stepData.step}
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-foreground mb-2">
                                      {stepData.title}
                                    </h5>
                                    <p className="text-muted-foreground text-sm mb-3">
                                      {stepData.description}
                                    </p>
                                    {stepData.tip && (
                                      <div className="bg-muted/30 rounded-lg p-3">
                                        <p className="text-xs text-muted-foreground">
                                          <strong>Pro Tip:</strong> {stepData.tip}
                                        </p>
                                      </div>
                                    )}
                                    {stepData.options && stepData.options.length > 0 && (
                                      <div className="grid grid-cols-2 gap-3 mt-3">
                                        {stepData.options.map((option: any, optIdx: number) => (
                                          <div key={optIdx} className="bg-muted/30 rounded-lg p-3">
                                            <h6 className="font-medium text-foreground text-sm mb-1">
                                              {option.method}
                                            </h6>
                                            <p className="text-xs text-muted-foreground">
                                              {option.details}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {stepData.requirements && stepData.requirements.length > 0 && (
                                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                        {stepData.requirements.map((req: string, reqIdx: number) => (
                                          <span
                                            key={reqIdx}
                                            className="flex items-center text-muted-foreground"
                                          >
                                            <CheckCircle className="text-primary h-4 w-4 mr-2" />
                                            {req}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </TabsContent>
                          );
                        })}
                      </Tabs>
                    ) : (
                      <div className="space-y-6">
                        {methodSteps.map((stepData: any, index: number) => (
                          <div key={index} className="flex space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 step-number rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                              {stepData.step}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-foreground mb-2">
                                {stepData.title}
                              </h5>
                              <p className="text-muted-foreground text-sm mb-3">
                                {stepData.description}
                              </p>
                              {stepData.tip && (
                                <div className="bg-muted/30 rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground">
                                    <strong>Pro Tip:</strong> {stepData.tip}
                                  </p>
                                </div>
                              )}
                              {stepData.options && stepData.options.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                  {stepData.options.map((option: any, optIdx: number) => (
                                    <div key={optIdx} className="bg-muted/30 rounded-lg p-3">
                                      <h6 className="font-medium text-foreground text-sm mb-1">
                                        {option.method}
                                      </h6>
                                      <p className="text-xs text-muted-foreground">
                                        {option.details}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {stepData.requirements && stepData.requirements.length > 0 && (
                                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                  {stepData.requirements.map((req: string, reqIdx: number) => (
                                    <span
                                      key={reqIdx}
                                      className="flex items-center text-muted-foreground"
                                    >
                                      <CheckCircle className="text-primary h-4 w-4 mr-2" />
                                      {req}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Mid-Content Ad */}
                <AdPlaceholder slot="results-mid-content" format="leaderboard" />
                <AdPlaceholder slot="results-mid-mobile" format="mobile-banner" />

                {/* Optimal Timing Card */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="text-primary h-5 w-5" />
                      </div>
                      <h4 className="text-xl font-semibold text-foreground">
                        Optimal Propagation Windows
                      </h4>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Primary Window */}
                      {primary && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-foreground">Primary Window</h5>
                            <Badge className="bg-primary text-primary-foreground">Best</Badge>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">{primary.label}</p>
                            <p className="text-lg font-semibold text-primary">
                              {primary.startDate} - {primary.endDate}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {primary.successRate}% success rate expected
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Secondary Window */}
                      {secondary && (
                        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-foreground">Secondary Window</h5>
                            <Badge className="bg-accent text-accent-foreground">Good</Badge>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">{secondary.label}</p>
                            <p className="text-lg font-semibold text-accent-foreground">
                              {secondary.startDate} - {secondary.endDate}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {secondary.successRate}% success rate expected
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Climate Considerations */}
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <h6 className="font-semibold text-foreground mb-2">
                        Climate Considerations for Zone {request.zone}
                      </h6>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li className="flex items-center space-x-2">
                          <Calendar className="text-primary h-4 w-4" />
                          <span>Last frost: {zoneInfo.lastFrost}</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Droplet className="text-primary h-4 w-4" />
                          <span>Ideal humidity: {zoneInfo.idealHumidity}</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <Sun className="text-primary h-4 w-4" />
                          <span>Growing season: {zoneInfo.growingSeason}</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Bottom Banner Ad */}
                <AdPlaceholder slot="results-bottom-banner" format="leaderboard" />
                <AdPlaceholder slot="results-bottom-mobile" format="mobile-banner" />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Reference */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">Quick Reference</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best Method:</span>
                        <span className="font-medium text-foreground capitalize">
                          {recommendedMethod.replace("-", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Success Rate:</span>
                        <span className="font-medium text-primary">{adjustedSuccessRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time to Root:</span>
                        <span className="font-medium text-foreground">{plant.timeToRoot}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Difficulty:</span>
                        <DifficultyBadge difficulty={plant.difficulty} size="sm" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar Ad 1 */}
                <AdPlaceholder slot="results-sidebar-1" format="rectangle" />

                {/* Care Tips */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">
                      Care After Propagation
                    </h4>
                    <div className="space-y-4">
                      <div className="flex space-x-3">
                        <Sun className="text-primary h-5 w-5 mt-1 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-foreground text-sm">
                            Light Requirements
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {plant.careInstructions.light}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Droplet className="text-primary h-5 w-5 mt-1 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-foreground text-sm">
                            Watering Schedule
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {plant.careInstructions.watering}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Leaf className="text-primary h-5 w-5 mt-1 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-foreground text-sm">
                            First Fertilizer
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {plant.careInstructions.fertilizer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Common Issues */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">Common Issues</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <h5 className="font-medium text-destructive text-sm mb-1 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Black/Mushy Stems
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          Overwatering or contaminated water. Start fresh with new cutting.
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <h5 className="font-medium text-yellow-800 dark:text-yellow-200 text-sm mb-1 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Slow Root Development
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          Normal in winter. Consider using rooting hormone or warming mat.
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h5 className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-1 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Wilting Leaves
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          Normal stress response. Trim large leaves to reduce energy demand.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar Ad 2 */}
                <AdPlaceholder slot="results-sidebar-2" format="rectangle" />

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => setLocation("/")}
                    data-testid="button-new-guide"
                  >
                    <Sprout className="mr-2 h-4 w-4" />
                    Create New Guide
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

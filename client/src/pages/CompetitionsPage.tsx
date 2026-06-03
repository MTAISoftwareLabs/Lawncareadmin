import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, Trophy, Camera, Clock, ThumbsUp, Users, Award, Calendar,
  ChevronRight, Upload
} from "lucide-react";
import { motion } from "framer-motion";

interface Competition {
  id: number;
  title: string;
  description: string;
  rules: string;
  prize: string;
  startDate: string;
  endDate: string;
  votingEndsAt: string;
  status: string;
}

interface CompetitionEntry {
  id: number;
  competitionId: number;
  userId: number;
  imageUrl: string;
  description: string;
  voteCount: number;
  user: {
    name: string;
    location: string;
  };
}

export function CompetitionsPage() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: activeCompetition } = useQuery<Competition>({
    queryKey: ["/api/competitions/active"],
  });

  const { data: entries = [] } = useQuery<CompetitionEntry[]>({
    queryKey: ["/api/competitions", activeCompetition?.id, "entries"],
    enabled: !!activeCompetition,
  });

  const { data: pastWinners = [] } = useQuery<any[]>({
    queryKey: ["/api/competitions/winners"],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Lawncare Workshop</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {user ? (
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Log In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Join Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Lawn of the Month</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Show off your hard work! Submit photos of your lawn to compete for bragging rights and prizes.
          </p>
        </motion.div>

        {/* Active Competition */}
        {activeCompetition && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <Badge className="bg-yellow-500 mb-2">Active Competition</Badge>
                    <CardTitle className="text-2xl">{activeCompetition.title}</CardTitle>
                    <CardDescription className="mt-2">{activeCompetition.description}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">
                      {getDaysRemaining(activeCompetition.endDate)}
                    </div>
                    <div className="text-sm text-muted-foreground">days remaining</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Prize</div>
                      <div className="font-medium text-foreground">{activeCompetition.prize}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Ends</div>
                      <div className="font-medium text-foreground">{formatDate(activeCompetition.endDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Entries</div>
                      <div className="font-medium text-foreground">{entries.length}</div>
                    </div>
                  </div>
                </div>
                
                {user ? (
                  <Button className="w-full sm:w-auto">
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Your Lawn
                  </Button>
                ) : (
                  <Link href="/signup">
                    <Button className="w-full sm:w-auto">
                      Join to Compete
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* Competition Entries */}
        {entries.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">Current Entries</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden border-border hover-elevate">
                    <div className="aspect-video relative">
                      {entry.imageUrl ? (
                        <img 
                          src={entry.imageUrl} 
                          alt={`${entry.user?.name}'s lawn`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Camera className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur text-foreground">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {entry.voteCount}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{entry.user?.name || "Anonymous"}</div>
                          <div className="text-sm text-muted-foreground">{entry.user?.location || "Unknown"}</div>
                        </div>
                        {user && (
                          <Button variant="outline" size="sm">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            Vote
                          </Button>
                        )}
                      </div>
                      {entry.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {entry.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* No Active Competition */}
        {!activeCompetition && (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Active Competition
              </h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for the next Lawn of the Month competition!
              </p>
              <Link href="/signup">
                <Button variant="outline">
                  Get Notified
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Past Winners */}
        {pastWinners.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">Past Winners</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pastWinners.map((winner, index) => (
                <Card key={winner.id} className="overflow-hidden border-border">
                  <div className="aspect-video relative">
                    <img 
                      src={winner.imageUrl || "/placeholder.png"} 
                      alt={`${winner.userName}'s winning lawn`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-yellow-500">
                        <Trophy className="w-3 h-3 mr-1" />
                        Winner
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="font-medium text-foreground">{winner.userName}</div>
                    <div className="text-sm text-muted-foreground">{winner.competitionTitle}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, title: "Submit Your Photo", description: "Take a photo of your lawn and upload it during the competition period." },
              { step: 2, title: "Community Votes", description: "Other members vote for their favorite lawns. The more votes, the better!" },
              { step: 3, title: "Win Prizes", description: "The lawn with the most votes wins bragging rights and awesome prizes." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">{item.step}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

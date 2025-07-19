import { ChevronDown, Database, LucideIcon, Shield, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Badge } from '~/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  methodColor: string;
  exampleResponse?: string;
  exampleCode?: string;
}

interface EndpointSection {
  icon: LucideIcon;
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export default function ApiDocs() {
  const endpoints: EndpointSection[] = [
    {
      icon: User,
      title: 'Players',
      description: 'Retrieve player data',
      endpoints: [
        {
          method: 'GET',
          path: '/player/{username}',
          description:
            'Get detailed player statistics including skills, combat level, and activity status.',
          methodColor: 'bg-green-500/10 text-green-600 border-green-200',
          exampleResponse: `
{
  "success": true,
  "data": {
    "Username": "Kelcei",
    "LoggedIn": false,
    "Skills": {
      "Level": 2907,
      "CombatLevel": 148,
      "XP": 628539982,
      "Rank": "122,374",
      "Skills": [
        {
          "JagexID": 26,
          "HumanName": "Invention",
          "Level": 120,
          "XP": 84738417,
          "Rank": 102376
        },
        [...]
      ],
      "Activities": [
        {
          "date": "18-Jul-2025 19:21",
          "details": "I killed 11 Powerful and imprisoned dinosaurs: Raksha, the Shadow Colossi.",
          "text": "I killed 11 Rakshas."
        },
        [...]
      ],
      "Quests": {
        "Completed": 198,
        "InProgress": 6,
        "NotStarted": 147,
        "Quests": [
          {
            "Title": "A Christmas Reunion",
            "Difficulty": 0,
            "Status": "COMPLETED",
            "Members": false,
            "QuestPoints": 0,
            "Eligible": true
          },
          [...]
        ]
    }
  }
}`,
        },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          API Documentation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Access RuneScape player data, clan information, and real-time statistics through our
          comprehensive API.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Base URL</CardTitle>
            </div>
            <CardDescription>All API requests should be made to:</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="bg-muted p-2 rounded text-sm block">https://rsx.lol/api</code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Authentication</CardTitle>
            </div>
            <CardDescription>API key required for most endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <code className="bg-muted p-2 rounded text-sm block">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Endpoints</h2>
        
        {endpoints.map((section) => {
          const IconComponent = section.icon;
          return (
            <Collapsible key={section.title} defaultOpen>
              <Card>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {section.title}
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=closed]:-rotate-90" />
                    </CardTitle>
                    <CardDescription className="text-left">{section.description}</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {section.endpoints.map((endpoint, index) => (
                      <div key={`${endpoint.method}-${endpoint.path}`}>
                        {index > 0 && <Separator />}
                        <Collapsible>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between gap-2 p-2 hover:bg-muted/50 rounded transition-colors">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={endpoint.methodColor}>
                                  {endpoint.method}
                                </Badge>
                                <code className="text-sm">{endpoint.path}</code>
                              </div>
                              <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=closed]:-rotate-90" />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="space-y-3 pt-2">
                              <p className="text-sm text-muted-foreground ml-12">
                                {endpoint.description}
                              </p>
                              
                              {endpoint.exampleResponse && (
                                <div className="ml-12 space-y-2">
                                  <h4 className="font-medium text-sm">Example Response:</h4>
                                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                                    {endpoint.exampleResponse}
                                  </pre>
                                </div>
                              )}
                              
                              {endpoint.exampleCode && (
                                <div className="ml-12 space-y-2">
                                  <h4 className="font-medium text-sm">Connection Example:</h4>
                                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                                    {endpoint.exampleCode}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>API usage limitations and fair use policy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">1000</div>
              <div className="text-sm text-muted-foreground">Requests per hour</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">50</div>
              <div className="text-sm text-muted-foreground">Requests per minute</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Concurrent connections</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Get support and connect with the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm"></div>
        </CardContent>
      </Card>
    </div>
  );
}

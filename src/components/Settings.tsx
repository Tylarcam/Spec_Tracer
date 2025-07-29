
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

const Settings: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Your application uses secure server-side API management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Secure Configuration:</strong> All API keys and sensitive data are managed 
              securely on the server side. No sensitive information is stored in your browser.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> For your protection, API keys are not configurable 
              from the client side. All external API communications go through secure Edge Functions.
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-muted-foreground">
            <p>✅ Secure server-side API management</p>
            <p>✅ No sensitive data in browser storage</p>
            <p>✅ Rate limiting and input validation</p>
            <p>✅ Encrypted data transmission</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

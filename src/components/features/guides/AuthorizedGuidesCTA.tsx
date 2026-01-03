/**
 * CTA Component - Link către Ghizi Autorizați
 * Să fie adăugat în GuidesPage.tsx
 */

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, ExternalLink } from "lucide-react";

export function AuthorizedGuidesCTA() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 shadow-lg">
      <CardContent className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-full p-6 shadow-xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Verifică Licența Oficială a Ghidului
              </h3>
              <p className="text-gray-700 mb-4">
                Consultă lista completă cu <strong>peste 2,500 ghizi autorizați</strong> de 
                Direcția Generală Turism (SITUR). Toate licențele sunt verificate oficial.
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
                <Button asChild size="lg" className="gap-2 shadow-md">
                  <Link to="/ghizi-autorizati">
                    <Shield className="h-5 w-5" />
                    Vezi Ghizi Autorizați SITUR
                  </Link>
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-4 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4" />
                  Sursă Oficială Guvernamentală
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex md:flex-col gap-4 md:gap-3">
              <div className="bg-white rounded-lg px-6 py-3 shadow-md text-center">
                <div className="text-3xl font-bold text-blue-600">2,500+</div>
                <div className="text-xs text-gray-600">Ghizi Autorizați</div>
              </div>
              <div className="bg-white rounded-lg px-6 py-3 shadow-md text-center">
                <div className="text-3xl font-bold text-green-600">✓</div>
                <div className="text-xs text-gray-600">Verificat SITUR</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

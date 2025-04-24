import React from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProgressGraph: React.FC = () => (
  <Card>
    <CardHeader className="border-b pb-3">
      <CardTitle className="text-lg flex items-center">
        <TrendingUp className="h-5 w-5 text-plank-green mr-2" />
        Plank Utveckling
      </CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="h-60 bg-gray-100 rounded-md flex items-center justify-center">
        <p className="text-gray-500">Utvecklingsdiagram kommer snart</p>
      </div>
    </CardContent>
  </Card>
);

export default ProgressGraph;

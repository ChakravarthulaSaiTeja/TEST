import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, BarChart3, Plus, Eye } from "lucide-react";

export default function Portfolio() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground">
          Manage your investment portfolio and track performance.
        </p>
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            <strong>Note:</strong> Currently showing index positions only. Stock positions will be added in the next updates.
          </p>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1,25,430.50</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+₹2,50,000</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+₹15,43,050</div>
            <p className="text-xs text-muted-foreground">
              +14.1% total return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              18 profitable, 6 at loss
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Actions */}
      <div className="flex space-x-4">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          View Analytics
        </Button>
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Positions</CardTitle>
          <CardDescription>
            Your active index investment positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Position 1 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center dark:bg-purple-900/50">
                  <span className="text-lg font-bold text-purple-600">NIFTY</span>
                </div>
                <div>
                  <p className="font-medium">NIFTY 50</p>
                  <p className="text-sm text-muted-foreground">10 units @ ₹23,200</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">₹2,32,000</p>
                <p className="text-sm text-green-600">+₹12,800 (+5.8%)</p>
              </div>
            </div>

            {/* Position 2 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center dark:bg-green-900/50">
                  <span className="text-lg font-bold text-green-600">SENSEX</span>
                </div>
                <div>
                  <p className="font-medium">SENSEX</p>
                  <p className="text-sm text-muted-foreground">5 units @ ₹72,500</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">₹3,62,500</p>
                <p className="text-sm text-green-600">+₹8,750 (+2.5%)</p>
              </div>
            </div>

            {/* Position 3 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center dark:bg-purple-900/50">
                  <span className="text-lg font-bold text-purple-600">BANK</span>
                </div>
                <div>
                  <p className="font-medium">NIFTY BANK</p>
                  <p className="text-sm text-muted-foreground">8 units @ ₹48,500</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">₹3,88,000</p>
                <p className="text-sm text-green-600">+₹19,400 (+5.3%)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

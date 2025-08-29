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
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125,430.50</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+$2,500</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$15,430.50</div>
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
            Your active investment positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Position 1 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center dark:bg-blue-900/50">
                  <span className="text-lg font-bold text-blue-600">AAPL</span>
                </div>
                <div>
                  <p className="font-medium">Apple Inc.</p>
                  <p className="text-sm text-muted-foreground">100 shares @ $175.43</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">$17,543.00</p>
                <p className="text-sm text-green-600">+$2,457.00 (+16.3%)</p>
              </div>
            </div>

            {/* Position 2 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center dark:bg-green-900/50">
                  <span className="text-lg font-bold text-green-600">TSLA</span>
                </div>
                <div>
                  <p className="font-medium">Tesla, Inc.</p>
                  <p className="text-sm text-muted-foreground">50 shares @ $245.67</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">$12,283.50</p>
                <p className="text-sm text-green-600">+$1,716.50 (+16.2%)</p>
              </div>
            </div>

            {/* Position 3 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center dark:bg-purple-900/50">
                  <span className="text-lg font-bold text-purple-600">NVDA</span>
                </div>
                <div>
                  <p className="font-medium">NVIDIA Corporation</p>
                  <p className="text-sm text-muted-foreground">75 shares @ $456.78</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">$34,258.50</p>
                <p className="text-sm text-green-600">+$8,551.70 (+33.3%)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

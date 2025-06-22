
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogFoundItemForm } from '@/components/forms/LogFoundItemForm';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
}

interface LostItem {
  caseNumber: string;
  itemName: string;
  itemType: string;
  status: string;
  dateReported: string;
  lastSeenLocation: string;
  reporterName: string;
  reporterEmail: string;
}

interface FoundItem {
  foundItemId: string;
  itemName: string;
  itemColor: string;
  foundDate: string;
  foundLocation: string;
  status: string;
  description: string;
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const [lostItems] = useState<LostItem[]>([
    {
      caseNumber: 'CU2024001',
      itemName: 'iPhone 13',
      itemType: 'Electronics',
      status: 'Reported',
      dateReported: '2024-01-15',
      lastSeenLocation: 'Library',
      reporterName: 'John Doe',
      reporterEmail: 'john.doe@stu.cu.edu.ng'
    },
    {
      caseNumber: 'CU2024002',
      itemName: 'Laptop Bag',
      itemType: 'Accessories',
      status: 'Matched',
      dateReported: '2024-01-14',
      lastSeenLocation: 'Computer Lab',
      reporterName: 'Jane Smith',
      reporterEmail: 'jane.smith@stu.cu.edu.ng'
    }
  ]);

  const [foundItems, setFoundItems] = useState<FoundItem[]>([
    {
      foundItemId: 'FI2024001',
      itemName: 'Laptop Bag',
      itemColor: 'Black',
      foundDate: '2024-01-16',
      foundLocation: 'Computer Lab',
      status: 'Found',
      description: 'Black laptop bag with university logo'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reported': return 'bg-blue-100 text-blue-800';
      case 'Found': return 'bg-green-100 text-green-800';
      case 'Matched': return 'bg-yellow-100 text-yellow-800';
      case 'Claimed': return 'bg-purple-100 text-purple-800';
      case 'Unclaimed': return 'bg-orange-100 text-orange-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFoundItemLogged = (newFoundItem: FoundItem) => {
    setFoundItems([newFoundItem, ...foundItems]);
  };

  const totalReports = lostItems.length;
  const totalFound = foundItems.length;
  const totalMatched = lostItems.filter(item => item.status === 'Matched').length;
  const totalClaimed = lostItems.filter(item => item.status === 'Claimed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100">CULfs System Administration</p>
              <p className="text-purple-200 text-sm">Welcome, {user.name}</p>
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="border-white text-white hover:bg-white hover:text-purple-600"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-blue-600 text-xl">📋</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Items Found</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFound}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <span className="text-yellow-600 text-xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Matched Items</p>
                  <p className="text-2xl font-bold text-gray-900">{totalMatched}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-purple-600 text-xl">🏆</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Items Claimed</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClaimed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="lost-items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-purple-100">
            <TabsTrigger value="lost-items" className="data-[state=active]:bg-white">Lost Items</TabsTrigger>
            <TabsTrigger value="found-items" className="data-[state=active]:bg-white">Found Items</TabsTrigger>
            <TabsTrigger value="log-found" className="data-[state=active]:bg-white">Log Found Item</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="lost-items">
            <Card>
              <CardHeader>
                <CardTitle>Reported Lost Items</CardTitle>
                <CardDescription>Manage all reported lost items in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lostItems.map((item) => (
                    <div key={item.caseNumber} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-medium">{item.itemName}</h3>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          Case: {item.caseNumber}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p><span className="font-medium">Reporter:</span> {item.reporterName}</p>
                          <p><span className="font-medium">Email:</span> {item.reporterEmail}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Type:</span> {item.itemType}</p>
                          <p><span className="font-medium">Date:</span> {item.dateReported}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Last Seen:</span> {item.lastSeenLocation}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button size="sm" variant="outline" className="border-purple-300 text-purple-600">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="border-green-300 text-green-600">
                          Mark as Found
                        </Button>
                        <Button size="sm" variant="outline" className="border-blue-300 text-blue-600">
                          Contact Reporter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="found-items">
            <Card>
              <CardHeader>
                <CardTitle>Found Items Inventory</CardTitle>
                <CardDescription>Items currently in the found items inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {foundItems.map((item) => (
                    <div key={item.foundItemId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="font-medium">{item.itemName}</h3>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {item.foundItemId}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <p><span className="font-medium">Color:</span> {item.itemColor}</p>
                          <p><span className="font-medium">Found Date:</span> {item.foundDate}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Location:</span> {item.foundLocation}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Description:</span> {item.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-purple-300 text-purple-600">
                          Match with Report
                        </Button>
                        <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-600">
                          Mark as Claimed
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="log-found">
            <LogFoundItemForm onFoundItemLogged={handleFoundItemLogged} />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-bold text-green-600">
                        {totalReports > 0 ? Math.round((totalClaimed / totalReports) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Reports</span>
                      <span className="font-bold text-blue-600">
                        {lostItems.filter(item => item.status === 'Reported').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items in Inventory</span>
                      <span className="font-bold text-purple-600">{foundItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Cases</span>
                      <span className="font-bold text-orange-600">
                        {lostItems.filter(item => !['Claimed', 'Archived'].includes(item.status)).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>New item found: {foundItems[0]?.itemName}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Item matched: {lostItems.find(item => item.status === 'Matched')?.itemName}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>New report: {lostItems[0]?.itemName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

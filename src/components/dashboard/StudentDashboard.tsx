
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportLostItemForm } from '@/components/forms/ReportLostItemForm';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  matricNo?: string;
}

interface LostItem {
  caseNumber: string;
  itemName: string;
  itemType: string;
  status: string;
  dateReported: string;
  lastSeenLocation: string;
}

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export const StudentDashboard = ({ user, onLogout }: StudentDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'report' | 'history'>('dashboard');
  const [reportedItems, setReportedItems] = useState<LostItem[]>([
    {
      caseNumber: 'CU2024001',
      itemName: 'iPhone 13',
      itemType: 'Electronics',
      status: 'Reported',
      dateReported: '2024-01-15',
      lastSeenLocation: 'Library'
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

  const handleItemReported = (newItem: LostItem) => {
    setReportedItems([newItem, ...reportedItems]);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Student Dashboard</h1>
              <p className="text-purple-100">Welcome back, {user.name}</p>
              <p className="text-purple-200 text-sm">Matric No: {user.matricNo}</p>
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

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'report'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Report Lost Item
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Reports
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <span className="text-blue-600 text-xl">📋</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Reports</p>
                      <p className="text-2xl font-bold text-gray-900">{reportedItems.length}</p>
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
                      <p className="text-2xl font-bold text-gray-900">
                        {reportedItems.filter(item => item.status === 'Found' || item.status === 'Claimed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <span className="text-yellow-600 text-xl">⏳</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportedItems.filter(item => item.status === 'Reported').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <span className="text-purple-600 text-xl">🎯</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Matched</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportedItems.filter(item => item.status === 'Matched').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Your most recently reported lost items</CardDescription>
              </CardHeader>
              <CardContent>
                {reportedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No items reported yet</p>
                    <Button
                      onClick={() => setActiveTab('report')}
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                    >
                      Report Your First Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportedItems.slice(0, 3).map((item) => (
                      <div key={item.caseNumber} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{item.itemName}</h3>
                          <p className="text-sm text-gray-600">Case: {item.caseNumber}</p>
                          <p className="text-sm text-gray-500">Last seen: {item.lastSeenLocation}</p>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'report' && (
          <ReportLostItemForm userId={user.id} onItemReported={handleItemReported} />
        )}

        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>My Reported Items</CardTitle>
              <CardDescription>Complete history of your reported lost items</CardDescription>
            </CardHeader>
            <CardContent>
              {reportedItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No items reported yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportedItems.map((item) => (
                    <div key={item.caseNumber} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{item.itemName}</h3>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><span className="font-medium">Case Number:</span> {item.caseNumber}</p>
                          <p><span className="font-medium">Type:</span> {item.itemType}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Date Reported:</span> {item.dateReported}</p>
                          <p><span className="font-medium">Last Seen:</span> {item.lastSeenLocation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

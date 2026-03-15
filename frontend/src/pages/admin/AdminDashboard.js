import AdminLayout from '../../components/common/AdminLayout';
import { 
  UsersIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const stats = [
    { 
      name: 'Total Users', 
      value: '67M+', 
      change: '+1.3M vs last week',
      icon: UsersIcon,
      iconBg: 'bg-blue-500',
      iconColor: 'text-white'
    },
    { 
      name: 'Total Hosts', 
      value: '248', 
      change: '+8.3% vs last week',
      icon: UserGroupIcon,
      iconBg: 'bg-gray-600',
      iconColor: 'text-white'
    },
    { 
      name: 'Total Units', 
      value: '1247', 
      change: '+15.2% vs last week',
      icon: BuildingOfficeIcon,
      iconBg: 'bg-purple-600',
      iconColor: 'text-white'
    },
    { 
      name: 'Total Revenue', 
      value: '$811.5K', 
      change: '+12.7% vs last week',
      icon: CurrencyDollarIcon,
      iconBg: 'bg-orange-500',
      iconColor: 'text-white'
    },
  ];

  // Sample data for charts
  const revenueData = [
    { date: 'Feb 15', value: 50000 },
    { date: 'Feb 16', value: 45000 },
    { date: 'Feb 17', value: 40000 },
    { date: 'Feb 18', value: 65000 },
    { date: 'Feb 19', value: 70000 },
    { date: 'Feb 20', value: 60000 },
  ];

  const bookingsData = [
    { date: 'Feb 15', value: 135 },
    { date: 'Feb 16', value: 95 },
    { date: 'Feb 17', value: 165 },
    { date: 'Feb 18', value: 75 },
    { date: 'Feb 19', value: 140 },
    { date: 'Feb 20', value: 155 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and analytics for Smart Stay AI</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Trend</h2>
            
            {/* Chart Container */}
            <div className="h-80 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4">
                <span>80000</span>
                <span>60000</span>
                <span>40000</span>
                <span>20000</span>
                <span>0</span>
              </div>
              
              {/* Chart area */}
              <div className="ml-12 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-t border-gray-100"></div>
                  ))}
                </div>
                
                {/* Line chart simulation */}
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    points="20,200 80,220 140,240 200,120 260,100 320,140"
                  />
                  {/* Data points */}
                  {[
                    [20, 200], [80, 220], [140, 240], [200, 120], [260, 100], [320, 140]
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="4" fill="#3B82F6" />
                  ))}
                </svg>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-gray-500 mt-2">
                {revenueData.map((item) => (
                  <span key={item.date}>{item.date}</span>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-blue-600 font-medium">Revenue ($)</span>
            </div>
          </div>

          {/* Bookings Overview Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Bookings Overview</h2>
            
            {/* Chart Container */}
            <div className="h-80 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4">
                <span>180</span>
                <span>135</span>
                <span>90</span>
                <span>45</span>
                <span>0</span>
              </div>
              
              {/* Chart area */}
              <div className="ml-12 h-full relative flex items-end justify-between px-4">
                {bookingsData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-purple-600 rounded-t-md w-12"
                      style={{ height: `${(item.value / 180) * 100}%` }}
                    ></div>
                  </div>
                ))}
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-gray-500 mt-2 px-4">
                {bookingsData.map((item) => (
                  <span key={item.date}>{item.date}</span>
                ))}
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <div className="w-3 h-3 bg-purple-600 rounded mr-2"></div>
              <span className="text-sm text-purple-600 font-medium">Bookings</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
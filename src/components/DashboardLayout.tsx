import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Bell, ChevronLeft, ChevronRight, Menu, Moon, Search, Sun, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
`;
if (!document.head.querySelector('style[data-dashboard-animation]')) {
  style.setAttribute('data-dashboard-animation', 'true');
  document.head.appendChild(style);
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Click outside to close
  useEffect(() => {
    const handleClick = () => setShowNotifications(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
  
  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', shortLabel: 'Dash' },
    { path: '/monitor', icon: '🔍', label: 'Monitor APIs', shortLabel: 'APIs' },
    { path: '/incidents', icon: '🚨', label: 'Incidents', shortLabel: 'Alerts' },
    { path: '/api-test', icon: '🧪', label: 'API Test', shortLabel: 'Test' },
  ];

  const notifications = [
    { id: 1, type: 'error', message: 'Payment API is down', time: '2 min ago', unread: true },
    { id: 2, type: 'warning', message: 'High response time on User API', time: '15 min ago', unread: true },
    { id: 3, type: 'success', message: 'All systems recovered', time: '1 hour ago', unread: false },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarCollapsed ? 80 : 280,
        }}
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white z-50 shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  API Doctor
                </h1>
                <p className="text-xs text-gray-400">Monitoring Dashboard</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:block p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl transition-all duration-300 group ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>
          
        {/* Alert Section */}
        {location.pathname === '/dashboard' && !sidebarCollapsed && (
          <div className="mt-8 px-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-medium text-amber-400">Alert Settings</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Sound</span>
                  <button className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                    🔊
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Mute All</span>
                  <button className="p-1.5 rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors">
                    🔕
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        <div className="mt-6 border-t border-gray-800 pt-4">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
            >
              <span>🔔</span>
              <span>Notifications</span>
              
              {/* Red dot */}
              <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="
                absolute 
                left-full 
                ml-4 
                -top-40 
                w-80 
                bg-gray-900 
                border border-gray-800 
                rounded-xl 
                shadow-xl 
                z-50
                animate-fadeIn
              ">
                
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
                  <p className="font-semibold text-white">Notifications</p>
                  <button className="text-blue-400 text-sm hover:underline">
                    Mark all read
                  </button>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-800">

                  {/* Item 1 */}
                  <div className="px-4 py-3 hover:bg-gray-800 transition">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2"></span>
                      <div>
                        <p className="text-sm text-white">Payment API is down</p>
                        <p className="text-xs text-gray-400">2 min ago</p>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="px-4 py-3 hover:bg-gray-800 transition">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></span>
                      <div>
                        <p className="text-sm text-white">
                          High response time on User API
                        </p>
                        <p className="text-xs text-gray-400">15 min ago</p>
                      </div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="px-4 py-3 hover:bg-gray-800 transition">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full mt-2"></span>
                      <div>
                        <p className="text-sm text-white">All systems recovered</p>
                        <p className="text-xs text-gray-400">1 hour ago</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="text-center py-3 border-t border-gray-800">
                  <button className="text-blue-400 text-sm hover:underline">
                    View all notifications
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      }`}>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-2 px-6">
          {/* Page Header with Title */}
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-xl text-white p-8 rounded-3xl mb-6 shadow-2xl shadow-blue-500/20 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  {title && (
                    <h1 className="text-3xl font-bold mb-2">{title}</h1>
                  )}
                  {subtitle && (
                    <p className="text-blue-100 text-lg">{subtitle}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

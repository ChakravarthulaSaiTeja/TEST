'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import MetricCard from '../components/MetricCard';
import Button, { PrimaryButton, SecondaryButton, IconButton } from '../components/Button';
import Tabs, { TabPanel, TabGroup } from '../components/Tabs';
import Modal, { useToast } from '../components/Modal';
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  BarChart3,
  Search,
  Bell,
  Settings,
  User,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';

const DemoPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toasts, success, error, warning, info, removeToast } = useToast();

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    success('Search', `Searching for "${query}"`);
  };

  const handleButtonClick = (type: string) => {
    switch (type) {
      case 'success':
        success('Success!', 'Operation completed successfully');
        break;
      case 'error':
        error('Error!', 'Something went wrong');
        break;
      case 'warning':
        warning('Warning!', 'Please check your input');
        break;
      case 'info':
        info('Info', 'Here is some information');
        break;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'analysis', label: 'Analysis', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'portfolio', label: 'Portfolio', icon: <Activity className="h-4 w-4" /> },
    { id: 'news', label: 'News', icon: <Bell className="h-4 w-4" /> }
  ];

  const mockData = [
    {
      title: 'Portfolio Value',
      value: 125430.50,
      change: 2340.25,
      changePercent: 1.89,
      currency: 'USD',
      icon: <DollarSign className="h-5 w-5" />,
      sparkline: [100, 105, 102, 108, 115, 120, 118, 125, 130, 128, 132, 135]
    },
    {
      title: 'Today\'s P&L',
      value: 2340.25,
      change: 2340.25,
      changePercent: 1.89,
      currency: 'USD',
      icon: <TrendingUp className="h-5 w-5" />,
      sparkline: [0, 5, 2, 8, 15, 20, 18, 25, 30, 28, 32, 35]
    },
    {
      title: 'Active Positions',
      value: 12,
      change: 2,
      changePercent: 20,
      format: 'number',
      icon: <Activity className="h-5 w-5" />,
      sparkline: [8, 9, 10, 11, 12, 11, 12, 13, 12, 12, 12, 12]
    },
    {
      title: 'Win Rate',
      value: 78.5,
      change: 2.3,
      changePercent: 3.02,
      format: 'percentage',
      icon: <BarChart3 className="h-5 w-5" />,
      sparkline: [70, 72, 75, 76, 78, 77, 78, 79, 78, 78, 78, 78]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary to-background-secondary">
      {/* Header */}
      <Header 
        onSearch={handleSearch}
        user={{ name: 'Demo User', email: 'demo@forecaster.ai' }}
        notifications={3}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Fintech Theme Demo
          </h1>
          <p className="text-muted text-lg">
            Premium trading platform UI components and design system
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="glass p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Search Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchBar 
                placeholder="Search stocks, companies..."
                onSearch={handleSearch}
                suggestions={['Apple Inc.', 'Tesla Inc.', 'Microsoft Corp.', 'Google LLC']}
              />
              <SearchBar 
                placeholder="Search with loading state..."
                onSearch={handleSearch}
                loading={true}
              />
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Metric Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockData.map((data, index) => (
              <MetricCard
                key={index}
                {...data}
                onClick={() => success('Card Clicked', `Clicked on ${data.title}`)}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="mb-8">
          <div className="glass p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Button Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Primary Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <PrimaryButton onClick={() => handleButtonClick('success')}>
                    Primary Button
                  </PrimaryButton>
                  <PrimaryButton size="lg" onClick={() => handleButtonClick('success')}>
                    Large Button
                  </PrimaryButton>
                  <PrimaryButton loading onClick={() => handleButtonClick('success')}>
                    Loading Button
                  </PrimaryButton>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Secondary Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <SecondaryButton onClick={() => handleButtonClick('info')}>
                    Secondary Button
                  </SecondaryButton>
                  <SecondaryButton size="lg" onClick={() => handleButtonClick('info')}>
                    Large Button
                  </SecondaryButton>
                  <SecondaryButton disabled onClick={() => handleButtonClick('info')}>
                    Disabled Button
                  </SecondaryButton>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Icon Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <IconButton 
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() => handleButtonClick('success')}
                    aria-label="Add"
                  />
                  <IconButton 
                    icon={<Minus className="h-4 w-4" />}
                    onClick={() => handleButtonClick('warning')}
                    aria-label="Remove"
                  />
                  <IconButton 
                    icon={<RefreshCw className="h-4 w-4" />}
                    onClick={() => handleButtonClick('info')}
                    aria-label="Refresh"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Toast Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => handleButtonClick('success')}>
                    Success Toast
                  </Button>
                  <Button variant="outline" onClick={() => handleButtonClick('error')}>
                    Error Toast
                  </Button>
                  <Button variant="outline" onClick={() => handleButtonClick('warning')}>
                    Warning Toast
                  </Button>
                  <Button variant="outline" onClick={() => handleButtonClick('info')}>
                    Info Toast
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="glass p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Tab Components</h2>
            <TabGroup>
              <Tabs
                items={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="default"
                fullWidth
              />
              
              <TabPanel activeTab={activeTab} tabId="overview">
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Overview Tab</h3>
                  <p className="text-muted">
                    This is the overview content. The tabs are fully functional with smooth animations.
                  </p>
                </div>
              </TabPanel>
              
              <TabPanel activeTab={activeTab} tabId="analysis">
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Analysis Tab</h3>
                  <p className="text-muted">
                    Analysis content goes here. Charts and technical indicators would be displayed here.
                  </p>
                </div>
              </TabPanel>
              
              <TabPanel activeTab={activeTab} tabId="portfolio">
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Portfolio Tab</h3>
                  <p className="text-muted">
                    Portfolio management interface would be here with position details and performance metrics.
                  </p>
                </div>
              </TabPanel>
              
              <TabPanel activeTab={activeTab} tabId="news">
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">News Tab</h3>
                  <p className="text-muted">
                    Market news and updates would be displayed here with real-time feeds.
                  </p>
                </div>
              </TabPanel>
            </TabGroup>
          </div>
        </div>

        {/* Modal Demo */}
        <div className="mb-8">
          <div className="glass p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Modal Component</h2>
            <PrimaryButton onClick={() => setIsModalOpen(true)}>
              Open Modal
            </PrimaryButton>
            
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Demo Modal"
              size="md"
            >
              <div className="space-y-4">
                <p className="text-muted">
                  This is a demo modal with glass morphism styling. It includes backdrop blur,
                  smooth animations, and proper focus management.
                </p>
                <div className="flex justify-end space-x-3">
                  <SecondaryButton onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton onClick={() => {
                    setIsModalOpen(false);
                    success('Modal Action', 'Modal action completed successfully');
                  }}>
                    Confirm
                  </PrimaryButton>
                </div>
              </div>
            </Modal>
          </div>
        </div>

        {/* Theme Colors */}
        <div className="mb-8">
          <div className="glass p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Theme Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="h-16 w-full bg-primary-gradient rounded-lg mb-2"></div>
                <p className="text-sm text-muted">Primary</p>
                <p className="text-xs text-muted">#00E0A4</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-full bg-secondary-gradient rounded-lg mb-2"></div>
                <p className="text-sm text-muted">Secondary</p>
                <p className="text-xs text-muted">#00C8FF</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-full bg-success-gradient rounded-lg mb-2"></div>
                <p className="text-sm text-muted">Success</p>
                <p className="text-xs text-muted">#00E676</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-full bg-danger-gradient rounded-lg mb-2"></div>
                <p className="text-sm text-muted">Danger</p>
                <p className="text-xs text-muted">#FF5252</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <Modal.ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default DemoPage;

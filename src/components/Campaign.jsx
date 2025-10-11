import React, { useState, useEffect, useCallback } from 'react';
import CampaignManager from './CampaignManager';
import RunCampaign from './RunCampaign';
import Analytics from './Analytics';
import { useAuth } from '../lib/authContext'; 
import * as api from '../api';

const Campaign = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('manage');
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampaigns = useCallback(async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const userCampaigns = await api.getCampaigns(user.id);
            setCampaigns(userCampaigns);
            setError(null);
        } catch (err) {
            setError('Failed to fetch campaigns. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleSaveCampaign = async (campaignData) => {
        if (!user) {
            setError("You must be logged in to save a campaign.");
            return;
        }

        try {
            const savedCampaign = await api.saveCampaign({ ...campaignData, userId: user.id });
            const updatedCampaigns = campaigns.map(c => c.id === savedCampaign.id ? savedCampaign : c);
            if (!campaigns.some(c => c.id === savedCampaign.id)) {
                updatedCampaigns.push(savedCampaign);
            }
            setCampaigns(updatedCampaigns);
            setSelectedCampaign(savedCampaign);
            setActiveTab('run');
        } catch (err) {
            setError('Failed to save campaign.');
            console.error(err);
        }
    };

    const handleSelectCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setActiveTab('run');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'manage':
                return <CampaignManager 
                            campaigns={campaigns}
                            onSave={handleSaveCampaign} 
                            onSelect={handleSelectCampaign}
                            selectedCampaign={selectedCampaign}
                            setSelectedCampaign={setSelectedCampaign}
                            isLoading={isLoading}
                            error={error}
                        />;
            case 'run':
                return <RunCampaign campaign={selectedCampaign} />;
            case 'analytics':
                return <Analytics campaign={selectedCampaign} />;
            default:
                return null;
        }
    };

    const TabButton = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === tabName 
                ? 'bg-red-600 text-white' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl font-bold mb-4">Campaigns</h1>
            <div className="flex space-x-2 border-b mb-4">
                <TabButton tabName="manage" label="Manage" />
                <TabButton tabName="run" label="Run" />
                <TabButton tabName="analytics" label="Analytics" />
            </div>
            <div>{renderContent()}</div>
        </div>
    );
};

export default Campaign;
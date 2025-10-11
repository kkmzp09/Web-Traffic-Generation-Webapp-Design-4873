import React, { useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit, FiSave, FiX, FiChevronRight } = FiIcons;

const CampaignManager = ({ campaigns, onSave, onSelect, selectedCampaign, setSelectedCampaign, isLoading, error }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState(null);

  useEffect(() => {
    if (selectedCampaign && !isEditing) {
      setEditedCampaign(selectedCampaign);
    }
  }, [selectedCampaign, isEditing]);

  const handleAddNew = () => {
    const newCampaign = {
      name: 'New Campaign',
      targetUrl: 'https://example.com',
      // Add other default fields for a new campaign
    };
    setEditedCampaign(newCampaign);
    setIsEditing(true);
  };

  const handleEdit = (campaign) => {
    setEditedCampaign({ ...campaign });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCampaign(selectedCampaign);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editedCampaign) {
      onSave(editedCampaign);
      setIsEditing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCampaign(prev => ({ ...prev, [name]: value }));
  };
  
  if (isLoading) {
    return <div className="text-center p-8">Loading campaigns...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold mb-4">{editedCampaign?.id ? 'Edit Campaign' : 'Create New Campaign'}</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
            <input
              type="text"
              name="name"
              value={editedCampaign?.name || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              placeholder="e.g. Summer Sale"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target URL</label>
            <input
              type="text"
              name="targetUrl"
              value={editedCampaign?.targetUrl || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              placeholder="https://example.com"
            />
          </div>
          {/* Add other campaign fields here */}
          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center space-x-2">
              <SafeIcon icon={FiX} />
              <span>Cancel</span>
            </button>
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2">
              <SafeIcon icon={FiSave} />
              <span>Save Campaign</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Campaigns</h2>
        <button onClick={handleAddNew} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2">
          <SafeIcon icon={FiPlus} />
          <span>New Campaign</span>
        </button>
      </div>
      <div className="space-y-2">
        {campaigns && campaigns.length > 0 ? (
          campaigns.map(campaign => (
            <div
              key={campaign.id}
              className={`p-3 rounded-md cursor-pointer flex justify-between items-center transition-colors ${selectedCampaign?.id === campaign.id ? 'bg-red-100 border-red-300' : 'hover:bg-gray-100 border-transparent'} border`}
              onClick={() => onSelect(campaign)}
            >
              <div className="flex-grow">
                <p className="font-semibold">{campaign.name}</p>
                <p className="text-sm text-gray-500">{campaign.targetUrl}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(campaign); }} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full">
                  <SafeIcon icon={FiEdit} />
                </button>
                <SafeIcon icon={FiChevronRight} className="text-gray-400" />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No campaigns found. Create one to get started.</p>
        )}
      </div>
    </div>
  );
};

export default CampaignManager;
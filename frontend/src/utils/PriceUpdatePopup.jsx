import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PriceUpdatePopup = ({ isOpen, onClose, onSubmit, currentPrice, slotInfo }) => {
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentPrice) {
      setNewPrice(currentPrice.toString());
    }
  }, [isOpen, currentPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPrice || parseFloat(newPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(parseFloat(newPrice));
      onClose();
    } catch (error) {
      toast.error('Failed to update price');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewPrice(currentPrice ? currentPrice.toString() : '');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Update Slot Price</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {slotInfo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Slot Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Vehicle Type:</span> {slotInfo.vehicleType?.vehicleType || 'N/A'}</p>
              <p><span className="font-medium">Slot Number:</span> {slotInfo.slotNumber}</p>
              <p><span className="font-medium">Current Price:</span> Rs.{currentPrice || 'N/A'}/hr</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Price (LKR per hour)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Rs.
              </span>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                min="0"
                step="0.01"
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter new price"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the new hourly rate for this parking slot
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Price'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PriceUpdatePopup; 
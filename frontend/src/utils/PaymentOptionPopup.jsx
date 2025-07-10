import { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaCreditCard, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentOptionPopup = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  amount,
  title = "Payment Options",
  initialOptions = [],
  loading = false 
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [paymentOptions, setPaymentOptions] = useState([
    ...initialOptions
  ]);
  const [showAddOption, setShowAddOption] = useState(false);
  const [newOption, setNewOption] = useState({ name: '', icon: 'FaCreditCard', color: 'text-gray-600' });

  useEffect(() => {
    if (isOpen) {
      setSelectedOption('');
      setShowAddOption(false);
      setNewOption({ name: '', icon: 'FaCreditCard', color: 'text-gray-600' });
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.error('Please select a payment option');
      return;
    }

    try {
      await onSubmit({
        paymentMethod: selectedOption,
        amount: amount
      });
      onClose();
    } catch (error) {
        console.log(error,"error--------------------------------");
      toast.error('Failed to process payment option');
    }
  };

  const handleClose = () => {
    setSelectedOption('');
    setShowAddOption(false);
    setNewOption({ name: '', icon: 'FaCreditCard', color: 'text-gray-600' });
    onClose();
  };

  const addPaymentOption = () => {
    if (!newOption.name.trim()) {
      toast.error('Payment option name is required');
      return;
    }

    const optionId = newOption.name.toLowerCase().replace(/\s+/g, '_');
    const newPaymentOption = {
      id: optionId,
      name: newOption.name.trim(),
      icon: FaCreditCard, // Default icon, you can expand this
      color: newOption.color,
      isCustom: true
    };

    setPaymentOptions(prev => [...prev, newPaymentOption]);
    setNewOption({ name: '', icon: 'FaCreditCard', color: 'text-gray-600' });
    setShowAddOption(false);
    toast.success('Payment option added successfully');
  };

  const removePaymentOption = (optionId) => {
    setPaymentOptions(prev => prev.filter(option => option.id !== optionId));
    if (selectedOption === optionId) {
      setSelectedOption('');
    }
    toast.success('Payment option removed successfully');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Amount Display */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount
          </label>
          <p className="text-2xl font-bold text-cyan-600">
            LKR {amount?.toLocaleString() || '0'}
          </p>
        </div>

        <div className="space-y-4">
          {/* Payment Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {paymentOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedOption === option.id
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedOption(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${option.color}`} />
                      <span className="font-medium text-gray-700">{option.name}</span>
                    </div>
                    {option.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePaymentOption(option.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove option"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Payment Option */}
          <div className="border-t pt-4">
            {!showAddOption ? (
              <button
                type="button"
                onClick={() => setShowAddOption(true)}
                className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium"
              >
                <FaPlus size={14} />
                Add Payment Option
              </button>
            ) : (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Option Name
                  </label>
                  <input
                    type="text"
                    value={newOption.name}
                    onChange={(e) => setNewOption(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., Mobile Money, Digital Wallet"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addPaymentOption}
                    className="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddOption(false)}
                    className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !selectedOption}
              className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-cyan-400 flex items-center gap-2 transition-colors"
            >
              {selectedOption === "cash" ? (
                'Recived Payment'
              ) : loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionPopup; 
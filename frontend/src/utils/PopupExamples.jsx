import React, { useState } from 'react';
import ConfirmationPopup from './ConfirmationPopup';
import PromptPopup from './PromptPopup';

// Example component showing how to use the reusable popups
const PopupExamples = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInfoPrompt, setShowInfoPrompt] = useState(false);

  const handleConfirmAction = () => {
    console.log('Action confirmed!');
    // Your action logic here
  };

  const handlePromptSubmit = (inputValue) => {
    console.log('Submitted:', inputValue);
    // Your action logic here
  };

  const handleDeleteAction = () => {
    console.log('Item deleted!');
    // Your delete logic here
  };

  const handleInfoSubmit = (inputValue) => {
    console.log('Info submitted:', inputValue);
    // Your action logic here
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Popup Examples</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Basic Confirmation */}
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Show Basic Confirmation
        </button>

        {/* Danger Confirmation */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Show Delete Confirmation
        </button>

        {/* Basic Prompt */}
        <button
          onClick={() => setShowPrompt(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Show Basic Prompt
        </button>

        {/* Info Prompt */}
        <button
          onClick={() => setShowInfoPrompt(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
        >
          Show Info Prompt
        </button>
      </div>

      {/* Basic Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message="Are you sure you want to proceed with this action?"
        confirmText="Yes, Proceed"
        cancelText="Cancel"
        confirmButtonClass="bg-blue-500 hover:bg-blue-600"
        icon="info"
      />

      {/* Danger Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAction}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        icon="danger"
      />

      {/* Basic Prompt Popup */}
      <PromptPopup
        isOpen={showPrompt}
        onClose={() => setShowPrompt(false)}
        onConfirm={handlePromptSubmit}
        title="Enter Information"
        message="Please provide the required information:"
        placeholder="Enter your input here..."
        confirmText="Submit"
        cancelText="Cancel"
        confirmButtonClass="bg-green-500 hover:bg-green-600"
        required={true}
        maxLength={100}
      />

      {/* Info Prompt Popup */}
      <PromptPopup
        isOpen={showInfoPrompt}
        onClose={() => setShowInfoPrompt(false)}
        onConfirm={handleInfoSubmit}
        title="Additional Information"
        message="Please provide any additional information (optional):"
        placeholder="Enter additional details..."
        confirmText="Save"
        cancelText="Cancel"
        confirmButtonClass="bg-purple-500 hover:bg-purple-600"
        required={false}
        maxLength={200}
      />
    </div>
  );
};

export default PopupExamples;

// Usage Examples:

/*
1. Basic Confirmation:
```jsx
const [showConfirm, setShowConfirm] = useState(false);

const handleConfirm = () => {
  // Your action logic
  console.log('Confirmed!');
};

<ConfirmationPopup
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="Are you sure you want to proceed?"
/>
```

2. Danger Confirmation:
```jsx
<ConfirmationPopup
  isOpen={showDeleteConfirm}
  onClose={() => setShowDeleteConfirm(false)}
  onConfirm={handleDelete}
  title="Confirm Deletion"
  message="This action cannot be undone."
  confirmText="Delete"
  confirmButtonClass="bg-red-500 hover:bg-red-600"
  icon="danger"
/>
```

3. Required Prompt:
```jsx
<PromptPopup
  isOpen={showPrompt}
  onClose={() => setShowPrompt(false)}
  onConfirm={(value) => console.log(value)}
  title="Enter Name"
  message="Please enter your full name:"
  placeholder="John Doe"
  required={true}
  maxLength={50}
/>
```

4. Optional Prompt:
```jsx
<PromptPopup
  isOpen={showOptionalPrompt}
  onClose={() => setShowOptionalPrompt(false)}
  onConfirm={(value) => console.log(value)}
  title="Comments"
  message="Add any additional comments (optional):"
  placeholder="Enter comments..."
  required={false}
  maxLength={200}
/>
```
*/ 
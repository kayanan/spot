import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaTimes } from 'react-icons/fa';

const FormData = ({
    isOpen,
    onClose,
    title,
    fields = [],
    onSubmit,
    initialData = {},
    submitButtonText = "Submit",
    cancelButtonText = "Cancel",
    type = "info"
}) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        fields.forEach(field => {
            if (field.required && !formData[field.name]) {
                newErrors[field.name] = `${field.label} is required`;
            }
            if (field.pattern && !field.pattern.test(formData[field.name])) {
                newErrors[field.name] = field.errorMessage || 'Invalid format';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-cyan-50 border-cyan-200';
        }
    };

    const renderField = (field) => {
        const commonProps = {
            name: field.name,
            value: formData[field.name] || '',
            onChange: handleChange,
            className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm ${
                errors[field.name] ? 'border-red-300' : ''
            }`,
            required: field.required,
            placeholder: field.placeholder
        };

        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        {...commonProps}
                        rows={field.rows || 3}
                    />
                );
            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            case 'checkbox':
                return (
                    <input
                        type="checkbox"
                        {...commonProps}
                        checked={formData[field.name] || false}
                        className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        {...commonProps}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                    />
                );
            default:
                return (
                    <input
                        type={field.type || 'text'}
                        {...commonProps}
                    />
                );
        }
    };

  return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl ${getTypeStyles()} p-6 text-left align-middle shadow-xl transition-all`}>
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                                >
                                    {title}
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {fields.map((field) => (
                                        <div key={field.name}>
                                            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {renderField(field)}
                                            {errors[field.name] && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors[field.name]}
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                            onClick={onClose}
                                        >
                                            {cancelButtonText}
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-900 hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                                        >
                                            {submitButtonText}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
  );
};

export default FormData;
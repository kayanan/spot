import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaTimes, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const PopUpMenu = ({
    isOpen,
    onClose,
    title,
    message,
    buttons = [],
    type = 'info', // 'info', 'success', 'warning', 'error'
    showCloseButton = true
}) => {
    console.log(buttons)
    const filteredButtons = buttons?.filter(button => Object.keys(button).length > 0);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheck className="h-6 w-6 text-green-500" />;
            case 'warning':
                return <FaExclamationTriangle className="h-6 w-6 text-yellow-500" />;
            case 'error':
                return <FaTimes className="h-6 w-6 text-red-500" />;
            default:
                return <FaClock className="h-6 w-6 text-cyan-500" />;
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

    const getButtonStyles = (variant) => {
        switch (variant) {
            case 'danger':
                return 'bg-red-100 text-red-900 hover:bg-red-200 focus-visible:ring-red-500';
            case 'success':
                return 'bg-green-100 text-green-900 hover:bg-green-200 focus-visible:ring-green-500';
            case 'warning':
                return 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200 focus-visible:ring-yellow-500';
            default:
                return 'bg-cyan-100 text-cyan-900 hover:bg-cyan-200 focus-visible:ring-cyan-500';
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog 
                as="div" 
                className="relative z-50" 
                onClose={onClose}
            >
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
                            <Dialog.Panel 
                                className={`
                                    w-full max-w-md transform overflow-hidden rounded-2xl 
                                    ${getTypeStyles()} p-6 text-left align-middle shadow-xl transition-all
                                `}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                        {getIcon()}
                                        <Dialog.Title
                                            as="h3"
                                            className="ml-3 text-lg font-medium leading-6 text-gray-900"
                                        >
                                            {title}
                                        </Dialog.Title>
                                    </div>

                                    {showCloseButton && (
                                        <button
                                            type="button"
                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                                            onClick={onClose}
                                        >
                                            <span className="sr-only">Close</span>
                                            <FaTimes className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>

                                <div className="mt-3">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-bold">
                                            {message}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-3 justify-end">
                                    {filteredButtons.map((button, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`
                                                inline-flex justify-center rounded-md border border-transparent 
                                                px-4 py-2 text-sm font-medium focus:outline-none 
                                                focus-visible:ring-2 focus-visible:ring-offset-2
                                                ${getButtonStyles(button.variant)}
                                            `}
                                            onClick={() => {
                                                button.onClick();
                                                if (button.closeOnClick !== false) {
                                                    onClose();
                                                }
                                            }}
                                        >
                                            {button.icon && (
                                                <span className="mr-2">
                                                    {button.icon}
                                                </span>
                                            )}
                                            {button.text}
                                        </button>
                                    ))}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default PopUpMenu;
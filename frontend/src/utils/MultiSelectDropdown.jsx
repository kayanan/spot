// src/utils/MultiSelectDropdown.jsx

import { useState } from "react";
import PropTypes from "prop-types";

const MultiSelectDropdown = ({ options, selectedValues, setSelectedValues }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (value) => {
    setSelectedValues(
      selectedValues.includes(value)
        ? selectedValues.filter((id) => id !== value)
        : [...selectedValues, value]
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        {selectedValues.length > 0
          ? options
              .filter((option) => selectedValues.includes(option.value))
              .map((option) => option.label)
              .join(", ")
          : "Select Branches"}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg mt-1 p-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-2 py-1 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => handleSelect(option.value)}
                className="h-4 w-4"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

MultiSelectDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    })
  ).isRequired,
  selectedValues: PropTypes.array.isRequired,
  setSelectedValues: PropTypes.func.isRequired,
};

export default MultiSelectDropdown;

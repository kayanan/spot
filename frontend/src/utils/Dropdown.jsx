// src/utils/Dropdown.jsx

import { Menu } from "@headlessui/react";
import PropTypes from "prop-types";

/**
 * Production-ready Headless UI dropdown.
 * - label: Placeholder text if nothing is selected.
 * - options: e.g. [ { value: "", label: "All" }, ... ]
 * - filterName: e.g. "status", "branch"
 * - selectedValue: current filter value (e.g. "active")
 * - onChange: callback(filterName, newValue)
 */
const Dropdown = ({ label, options, filterName, selectedValue, onChange }) => {
  // Find the label to display for the current selection
  const currentLabel =
    selectedValue && options.find((opt) => opt.value === selectedValue)
      ? options.find((opt) => opt.value === selectedValue).label
      : label;

  return (
    <Menu as="div" className="relative inline-block text-left w-full">
      <Menu.Button className="w-full p-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
        {currentLabel}
      </Menu.Button>

      <Menu.Items className="absolute mt-2 w-full bg-white border border-gray-200 rounded shadow-lg z-10">
        {options.map((option) => (
          <Menu.Item key={option.value}>
            {({ active }) => (
              <div
                onClick={() => onChange(filterName, option.value)}
                className={`cursor-pointer px-4 py-2 ${
                  active ? "bg-cyan-500 text-white" : "text-gray-700"
                }`}
              >
                {option.label}
              </div>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
};

Dropdown.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ).isRequired,
  filterName: PropTypes.string.isRequired,
  selectedValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default Dropdown;

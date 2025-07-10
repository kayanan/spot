import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

const DropdownInner= ({ label, name, options, formData, setFormData, errors, setErrors, defaultValue ,isSearch=false}) => {
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, options]);

  useEffect(() => {
    if (((formData[name] !== false) && (formData[name] !== null)) && defaultValue) {
      setFormData((prev) => ({ ...prev, [name]: defaultValue }));
    }
  }, [formData, name, defaultValue, setFormData]);

  const handleSelection = (value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear errors when value changes
    setSearch(""); // Reset search after selection
    setIsOpen(false); // Close dropdown
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && <label className="block text-gray-700 mb-1">{label}</label>}
      <div
        className={`border rounded p-2 cursor-pointer bg-white ${
          errors[name] ? "border-red-500" : "border-gray-300"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{options.find((opt) => opt.value === formData[name])?.label || "Select an option"}</span>
      </div>

      {isOpen && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
          {isSearch&&(<input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border-b border-gray-300 focus:outline-none"
          />)}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelection(option.value)}
                  className="p-2 hover:bg-gray-200 cursor-pointer flex items-center bg-white text-black"
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}

      {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
    </div>
  );
};

DropdownInner.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  errors: PropTypes.object,
  setErrors: PropTypes.func.isRequired,
  defaultValue: PropTypes.string,
  isSearch:PropTypes.bool,
};

export default DropdownInner;

import { useLocation, Link } from "react-router-dom";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { GlobeAltIcon } from "@heroicons/react/outline";
import DistrictList from "../District/DistrictList";

const ViewProvince = () => {
  const location = useLocation();
  const { Province ,status} = location.state || {};

  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
      <Link
        to="/province"
        state={{status}}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-cyan-600"
      >
        <FaArrowLeft className="mr-2" />
        Back to Province List
      </Link>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="shadow-md rounded-lg p-6 flex flex-col items-center bg-gray-100">
          <div className="relative w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden">
            <GlobeAltIcon className="object-cover w-full h-full bg-white" />
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold capitalize">{Province.name}</h2>
          </div>
        </div>

        {/* Parent Shop Details Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Province Details</h3>
            <span
              className={`text-base font-semibold px-2 py-1 rounded ${
                Province.isActive === true
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {Province.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base font-medium text-gray-500">
                Province Name
              </p>
              <p className="text-base font-semibold">{Province.name}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-1 mt-6">
        <div className="p-2">
          <DistrictList Province={Province} />
        </div>
      </div>
    </div>
  );
};

export default ViewProvince;

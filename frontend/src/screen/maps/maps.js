// maps.js
import MainMap from "./mainMap/index";

const Maps = ({ prediction }) => {
  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 z-0">
        <MainMap prediction={prediction} />
      </div>
    </div>
  );
};

export default Maps;
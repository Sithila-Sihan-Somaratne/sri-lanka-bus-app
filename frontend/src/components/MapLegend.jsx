import React, { useState, useRef, useEffect } from 'react';

const LegendItem = ({ color, label, icon }) => (
  <div className="flex items-center space-x-2">
    <div 
      style={{ backgroundColor: color }} 
      className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold"
    >
      {icon}
    </div>
    <span className="text-gray-700 font-medium">{label}</span>
  </div>
);

const MapLegend = ({ userLocation }) => {
  // State for managing the legend's position and drag status
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const legendRef = useRef(null);

  // Use a ref to store the current position
  const positionRef = useRef(position);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    if (legendRef.current && legendRef.current.contains(e.target)) {
        setIsDragging(true);
        setOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    }
  };

  // Handle mouse move to update position
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners to the document for a smoother drag experience
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset]);


  return (
    <div 
      ref={legendRef}
      className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 text-xs z-[1000] overflow-y-auto max-h-[250px] cursor-move"
      style={{ top: position.y, left: position.x }}
      onMouseDown={handleMouseDown}
    >
      <div className="font-bold text-gray-800 mb-2 flex items-center text-sm">
        <span className="mr-2">🗺️</span>
        Map Legend
      </div>
      <div className="space-y-1">
        <LegendItem color="#10b981" label="Origin (Start)" icon="A" />
        <LegendItem color="#ef4444" label="Destination (End)" icon="B" />
        <LegendItem color="#6b7280" label="Bus Stop" icon="•" />
        <LegendItem color="#3b82f6" label="Live Bus" icon="🚌" />
        {userLocation && (
          <LegendItem color="#8b5cf6" label="Your Location" icon="📍" />
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live tracking active</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
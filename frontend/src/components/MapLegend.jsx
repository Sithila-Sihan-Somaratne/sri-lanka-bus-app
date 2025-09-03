import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
    originIcon,
    destinationIcon,
    busStopIcon,
    busIcon,
    userLocationIcon
} from '../utils/mapIcons';

const LegendItem = ({ icon, label }) => (
    <div className="flex items-center space-x-2">
        <div className="w-6 h-6 flex items-center justify-center">
            <div dangerouslySetInnerHTML={{ __html: icon.options.html }} />
        </div>
        <span className="text-gray-700 font-medium">{label}</span>
    </div>
);

const MapLegend = ({ userLocation }) => {
    const [showLegend, setShowLegend] = useState(true);
    const [position, setPosition] = useState({ x: 16, y: 16 });
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const clickStartRef = useRef({ x: 0, y: 0 });
    const positionRef = useRef(position);
    
    useEffect(() => {
        positionRef.current = position;
    }, [position]);

    const handleDragMouseDown = (e) => {
        if (e.target.closest('.legend-handle')) {
            e.stopPropagation();
            e.preventDefault();
            clickStartRef.current = { x: e.clientX, y: e.clientY };
            setIsDragging(true);
            setOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - offset.x,
                y: e.clientY - offset.y,
            });
        }
    };

    const handleDragMouseUp = (e) => {
        setIsDragging(false);
        const movedX = Math.abs(e.clientX - clickStartRef.current.x);
        const movedY = Math.abs(e.clientY - clickStartRef.current.y);
        const isClick = movedX < 5 && movedY < 5;
        if (isClick && e.target.closest('.legend-handle')) {
            setShowLegend(prev => !prev);
        }
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleDragMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleDragMouseUp);
        };
    }, [isDragging, offset]);

    return (
        <div
            className="absolute bg-white rounded-lg shadow-xl border border-gray-200 text-xs z-[1000]"
            style={{ top: position.y, left: position.x }}
        >
            <div
                onMouseDown={handleDragMouseDown}
                className="legend-handle p-4 font-bold text-gray-800 flex items-center justify-between text-sm cursor-grab active:cursor-grabbing"
            >
                <span className="flex items-center pointer-events-none">
                    <span className="mr-2">🗺️</span>
                    Map Legend
                </span>
                {showLegend ? <ChevronUp className="w-4 h-4 text-gray-500 pointer-events-none" /> : <ChevronDown className="w-4 h-4 text-gray-500 pointer-events-none" />}
            </div>
            {showLegend && (
                <div className="p-4 border-t border-gray-200">
                    <div className="space-y-1 mb-2">
                        <LegendItem icon={originIcon} label="Origin (Start)" />
                        <LegendItem icon={destinationIcon} label="Destination (End)" />
                        <LegendItem icon={busStopIcon} label="Bus Stop" />
                        <LegendItem icon={busIcon} label="Live Bus" />
                        {userLocation && (
                            <LegendItem icon={userLocationIcon} label="Your Location" />
                        )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-500">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Live tracking active</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapLegend;
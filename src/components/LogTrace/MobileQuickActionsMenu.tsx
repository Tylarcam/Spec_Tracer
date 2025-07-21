
import React, { useState } from 'react';
import { Camera, Sparkles, Bug, Eye, X, Search, Menu } from 'lucide-react';

/**
 * Props interface for the MobileQuickActionsMenu component
 * @interface MobileQuickActionsMenuProps
 * @property {boolean} isVisible - Controls whether the menu is visible on screen
 * @property {() => void} onToggle - Callback function when the main toggle button is clicked
 * @property {(action: string) => void} onAction - Callback function when a quick action is selected
 */
interface MobileQuickActionsMenuProps {
  isVisible: boolean;
  onToggle: () => void;
  onAction: (action: string) => void;
}

/**
 * Configuration array defining all available quick actions
 * Each action has an id (for identification), label (for display), and icon (Lucide React icon component)
 * The order determines the positioning in the fan layout
 */
const quickActions = [
  { id: 'inspector', label: 'Inspector', icon: Eye },      // Opens element inspector panel
  { id: 'screenshot', label: 'Screenshot', icon: Camera }, // Activates screenshot capture mode
  { id: 'context', label: 'Context', icon: Sparkles },     // Generates AI context for selected element
  { id: 'debug', label: 'Debug', icon: Bug },              // Opens AI debug modal
  { id: 'terminal', label: 'Terminal', icon: Search },     // Opens debug terminal panel
];

/**
 * MobileQuickActionsMenu Component
 * 
 * A floating action button with a semi-circular fan of quick actions that appears when expanded.
 * Designed for mobile devices to provide easy access to debugging tools.
 * 
 * Features:
 * - Semi-circular fan layout with upward curve
 * - Staggered animation for icon appearance
 * - Smooth transitions between Menu and X icons
 * - Responsive design with hover effects
 * 
 * @param {MobileQuickActionsMenuProps} props - Component props
 * @returns {JSX.Element | null} The mobile quick actions menu component
 */
const MobileQuickActionsMenu: React.FC<MobileQuickActionsMenuProps> = ({
  isVisible,
  onToggle,
  onAction,
}) => {
  /**
   * Local state to track whether the fan is expanded (open) or collapsed (closed)
   * This controls the visibility of the fan background and action icons
   */
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Handles the main toggle button click
   * 
   * When clicked:
   * 1. Toggles the local expanded state
   * 2. If expanding (opening), calls the parent's onToggle callback
   * 3. If collapsing (closing), just updates local state
   * 
   * This creates a smooth open/close behavior while notifying the parent component
   */
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      onToggle(); // Notify parent only when opening
    }
  };

  /**
   * Handles when a user clicks on one of the quick action icons
   * 
   * @param {string} actionId - The ID of the selected action (e.g., 'inspector', 'screenshot')
   * 
   * When an action is selected:
   * 1. Calls the parent's onAction callback with the action ID
   * 2. Automatically closes the fan by setting isExpanded to false
   * 3. This provides immediate feedback and prevents the fan from staying open
   */
  const handleActionSelect = (actionId: string) => {
    onAction(actionId);
    setIsExpanded(false); // Auto-close after selection
  };

  // Early return if the component should not be visible
  // This prevents rendering when the parent component doesn't want the menu shown
  if (!isVisible) return null;

  /**
   * Calculates the position for each action icon along the semi-circular fan curve
   * 
   * @param {number} index - The index of the action in the quickActions array (0-4)
   * @returns {{x: number, y: number}} The calculated position relative to the fan center
   * 
   * Mathematical approach:
   * 1. Divides a 180-degree semi-circle into equal segments
   * 2. Uses trigonometry to calculate x,y coordinates for each position
   * 3. Flattens the curve slightly (0.6 multiplier) for better visual appeal
   * 4. Returns positions that will be used with CSS calc() for precise positioning
   */
  const getActionPosition = (index: number) => {
    const totalActions = quickActions.length; // Should be 5
    const fanWidth = 240;  // Width of the semi-circular fan in pixels
    const fanHeight = 120; // Height of the semi-circular fan in pixels
    
    // Define the angle range for the semi-circle (0° to 180°)
    const startAngle = 0;   // Leftmost position
    const endAngle = 180;   // Rightmost position
    const angleRange = endAngle - startAngle; // 180 degrees total
    
    // Calculate how much to increment the angle for each action
    const angleStep = angleRange / (totalActions - 1); // 45° between each icon
    
    // Calculate the specific angle for this index
    const angle = (startAngle + (index * angleStep)) * (Math.PI / 180); // Convert to radians
    
    // Calculate position along the semi-circular curve
    const radius = fanWidth / 2; // 120px radius
    const x = Math.cos(angle) * radius;                    // X coordinate
    const y = -Math.sin(angle) * radius * 0.6;            // Y coordinate (negative flips upward, 0.6 flattens curve)
    
    return { x, y };
  };

  return (
    /**
     * Main container positioned at the bottom center of the screen
     * Uses fixed positioning to stay in place regardless of page scroll
     */
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      
      {/* 
        Semi-circular fan background with action icons
        Only renders when isExpanded is true (fan is open)
      */}
      {isExpanded && (
        <div className="relative mb-4">
          
          {/* 
            Semi-circular fan background element
            Uses CSS clip-path to create the curved fan shape
            The polygon creates a smooth curve from left to right
          */}
          <div 
            className="w-60 h-30 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-b-full shadow-lg border-2 border-cyan-300/30"
            style={{
              // CSS clip-path creates the semi-circular fan shape
              // The polygon points define the curve: starting from top-left, going to top-right,
              // then curving down in a semi-circle pattern
              clipPath: 'polygon(0 0, 100% 0, 100% 60%, 85% 75%, 70% 85%, 50% 90%, 30% 85%, 15% 75%, 0 60%)',
            }}
          />
          
          {/* 
            Container for positioning the action icons along the fan curve
            Uses absolute positioning to place icons precisely on the fan background
          */}
          <div className="absolute inset-0 flex items-center justify-center">
            {quickActions.map((action, index) => {
              // Calculate the position for this specific icon
              const position = getActionPosition(index);
              
              return (
                /**
                 * Individual action icon button
                 * Each icon is positioned along the semi-circular curve
                 * Has hover effects and click handlers
                 */
                <div
                  key={action.id}
                  className="absolute w-10 h-10 bg-gray-700 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 border border-white/30"
                  style={{
                    // Position the icon using calculated coordinates
                    left: `calc(50% + ${position.x}px)`,  // Center horizontally + calculated X offset
                    top: `calc(50% + ${position.y}px)`,   // Center vertically + calculated Y offset
                    transform: 'translate(-50%, -50%)',   // Center the icon on its calculated position
                    
                    // Staggered animation: each icon appears with a delay based on its index
                    // This creates a wave effect as icons appear one by one
                    animation: `fadeInScale 0.3s ease-out ${index * 0.1}s both`,
                  }}
                  onClick={() => handleActionSelect(action.id)}
                >
                  {/* Render the icon component with consistent styling */}
                  <action.icon className="text-white" size={16} />
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 
        Main center toggle button
        This is the primary button that users click to open/close the fan
        Changes between Menu (☰) and X (✕) icons based on state
      */}
      <button
        onClick={handleToggle}
        className={`w-16 h-16 bg-cyan-500 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-4 border-cyan-400/50 hover:bg-cyan-600 ${
          isExpanded ? 'bg-cyan-600' : '' // Darker background when expanded
        }`}
        style={{
          // Custom shadow for depth and visual appeal
          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.3)',
        }}
      >
        {/* 
          Conditional rendering of icons based on expanded state
          Smooth transition between Menu and X icons
        */}
        {isExpanded ? (
          <X className="text-white" size={24} />      // X icon when fan is open
        ) : (
          <Menu className="text-white" size={24} />   // Menu icon when fan is closed
        )}
      </button>

      {/* 
        CSS Keyframes for the fadeInScale animation
        This defines how the action icons appear when the fan opens
        
        The animation:
        1. Starts with 0 opacity and 30% scale (invisible and small)
        2. Ends with 100% opacity and 100% scale (fully visible and normal size)
        3. Uses ease-out timing for smooth deceleration
        4. Combined with staggered delays for wave effect
      */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.3);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `
      }} />
    </div>
  );
};

export default MobileQuickActionsMenu;

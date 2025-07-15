
import React from 'react';

export const FormElements: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input 
          type="text" 
          placeholder="Email address"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          data-testid="email-input"
        />
        <input 
          type="password" 
          placeholder="Password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          data-testid="password-input"
        />
      </div>
      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
        <option value="">Choose an option</option>
        <option value="developer">Frontend Developer</option>
        <option value="designer">UI/UX Designer</option>
        <option value="manager">Product Manager</option>
      </select>
      <textarea 
        placeholder="Tell us about your project..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
        data-testid="description-textarea"
      />
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="terms" className="rounded focus:ring-2 focus:ring-cyan-500" />
        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
          I agree to the terms and conditions
        </label>
      </div>
    </div>
  );
};

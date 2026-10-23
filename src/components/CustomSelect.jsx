import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect - A sleek, accessible, custom-animated dropdown component
 * Eliminates macOS default dark/ugly native select menus and broken native arrows.
 * Supports icons, colored badges, item counts, and smooth spring animations.
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Chọn một mục...',
  icon: LeadingIcon,
  className = '',
  style = {},
  menuStyle = {},
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Find currently selected option
  const selectedOption = options.find((opt) => {
    const optVal = typeof opt === 'object' ? opt.value : opt;
    return String(optVal) === String(value);
  });

  const getLabel = (opt) => {
    if (!opt) return placeholder;
    return typeof opt === 'object' ? opt.label : opt;
  };

  const selectedLabel = selectedOption ? getLabel(selectedOption) : placeholder;

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{ position: 'relative', display: 'inline-block', userSelect: 'none', ...style }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
          {LeadingIcon && <LeadingIcon size={15} className="custom-select-leading-icon" />}
          {selectedOption && typeof selectedOption === 'object' && selectedOption.dotColor && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: selectedOption.dotColor,
                flexShrink: 0
              }}
            />
          )}
          <span className="custom-select-label" title={selectedLabel}>
            {selectedLabel}
          </span>
          {selectedOption && typeof selectedOption === 'object' && selectedOption.count !== undefined && (
            <span className="custom-select-badge">{selectedOption.count}</span>
          )}
        </div>

        <ChevronDown
          size={15}
          className={`custom-select-arrow ${isOpen ? 'open' : ''}`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div
          className="custom-select-menu"
          role="listbox"
          style={menuStyle}
        >
          {options.map((opt, idx) => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const isSelected = String(optVal) === String(value);
            const dotColor = typeof opt === 'object' ? opt.dotColor : null;
            const badge = typeof opt === 'object' ? opt.badge : null;
            const count = typeof opt === 'object' ? opt.count : undefined;

            return (
              <div
                key={idx}
                className={`custom-select-item ${isSelected ? 'selected' : ''}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(optVal);
                  setIsOpen(false);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  {dotColor && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: dotColor,
                        flexShrink: 0
                      }}
                    />
                  )}
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {optLabel}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {badge && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--primary)'
                      }}
                    >
                      {badge}
                    </span>
                  )}
                  {count !== undefined && (
                    <span className="custom-select-item-count">{count}</span>
                  )}
                  {isSelected && <Check size={14} className="custom-select-check" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

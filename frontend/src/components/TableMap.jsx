import { useMemo } from 'react';
import './TableMap.css';

/**
 * Visual Table Map Component - Cinema-style table selection
 * Shows all tables with visual indicators for available/reserved/selected
 */
export default function TableMap({ 
  availableTables = [], 
  selectedTable = null, 
  onTableSelect,
  totalTables = 20 
}) {
  // Create array of all tables with their status
  const tables = useMemo(() => {
    return Array.from({ length: totalTables }, (_, i) => {
      const tableNumber = i + 1;
      const isAvailable = availableTables.includes(tableNumber);
      const isSelected = selectedTable === tableNumber;
      
      return {
        number: tableNumber,
        available: isAvailable,
        selected: isSelected,
        status: isSelected ? 'selected' : isAvailable ? 'available' : 'reserved'
      };
    });
  }, [availableTables, selectedTable, totalTables]);

  const handleTableClick = (tableNumber, isAvailable) => {
    if (isAvailable && onTableSelect) {
      onTableSelect(tableNumber);
    }
  };

  return (
    <div className="table-map-container">
      <div className="table-map-legend">
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color reserved"></div>
          <span>Reserved</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected</span>
        </div>
      </div>
      
      <div className="table-map-grid">
        {tables.map((table) => (
          <button
            key={table.number}
            type="button"
            className={`table-seat ${table.status}`}
            onClick={() => handleTableClick(table.number, table.available)}
            disabled={!table.available}
            title={
              table.selected 
                ? `Table ${table.number} - Selected` 
                : table.available 
                ? `Table ${table.number} - Available` 
                : `Table ${table.number} - Reserved`
            }
          >
            <span className="table-number">{table.number}</span>
            {table.selected && <span className="table-check">✓</span>}
          </button>
        ))}
      </div>
      
      {selectedTable && (
        <div className="table-selection-info">
          <strong>Selected: Table {selectedTable}</strong>
        </div>
      )}
    </div>
  );
}


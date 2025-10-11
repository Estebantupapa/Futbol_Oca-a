import React from 'react';
import { AdminSidebarProps } from '../coach/types/adminTypes';
import AdminPlayerItem from './AdminPlayerItem';

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  searchTerm,
  selectedCategory,
  selectedSchool,
  showCategoryDropdown,
  showSchoolDropdown,
  players,
  filteredPlayers,
  categorias,
  escuelas,
  //currentUser,
  loading,
  onSearchChange,
  onCategorySelect,
  onSchoolSelect,
  onClearCategory,
  onClearSchool,
  onToggleCategoryDropdown,
  onToggleSchoolDropdown,
  onPlayerClick
}) => {
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return 'Todas las categorías';
    const category = categorias.find(cat => cat.id === selectedCategory);
    return category?.nombre || 'Categoría desconocida';
  };

  const getSelectedSchoolName = () => {
    if (!selectedSchool) return 'Todas las escuelas';
    const school = escuelas.find(esc => esc.id === selectedSchool);
    return school?.nombre || 'Escuela desconocida';
  };

  return (
    <div className="sidebar">
      <div className="search-section">
        <div className="d-flex align-items-center mb-3">
          {/* Botón de categorías */}
          <div className="position-relative me-2">
            <button 
              id="category-button"
              className={`btn btn-outline-secondary btn-sm d-flex align-items-center ${selectedCategory ? 'btn-primary text-white' : ''}`}
              onClick={onToggleCategoryDropdown}
              title="Filtrar por categoría"
            >
              <span className="me-1">📋</span>
            </button>
            
            {showCategoryDropdown && (
              <div 
                id="category-dropdown"
                className="position-absolute bg-white border rounded shadow-sm mt-1"
                style={{ 
                  zIndex: 1000, 
                  minWidth: '200px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  left: 0
                }}
              >
                <div className="p-2">
                  <div className="fw-bold mb-2 text-muted small">Filtrar por categoría:</div>
                  
                  <button
                    className={`btn btn-sm w-100 mb-1 text-start ${!selectedCategory ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={onClearCategory}
                  >
                    <span className="me-2">🏆</span>
                    Todas las categorías
                    {!selectedCategory && <span className="float-end">✓</span>}
                  </button>
                  
                  {categorias.map(categoria => (
                    <button
                      key={categoria.id}
                      className={`btn btn-sm w-100 mb-1 text-start ${
                        selectedCategory === categoria.id ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => onCategorySelect(categoria.id)}
                    >
                      <span className="me-2">⚽</span>
                      {categoria.nombre}
                      {selectedCategory === categoria.id && <span className="float-end">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botón de escuelas */}
          <div className="position-relative me-2">
            <button 
              id="school-button"
              className={`btn btn-outline-secondary btn-sm d-flex align-items-center ${selectedSchool ? 'btn-success text-white' : ''}`}
              onClick={onToggleSchoolDropdown}
              title="Filtrar por escuela"
            >
              <span className="me-1">🏫</span>
            </button>
            
            {showSchoolDropdown && (
              <div 
                id="school-dropdown"
                className="position-absolute bg-white border rounded shadow-sm mt-1"
                style={{ 
                  zIndex: 1000, 
                  minWidth: '200px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  left: 0
                }}
              >
                <div className="p-2">
                  <div className="fw-bold mb-2 text-muted small">Filtrar por escuela:</div>
                  
                  <button
                    className={`btn btn-sm w-100 mb-1 text-start ${!selectedSchool ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={onClearSchool}
                  >
                    <span className="me-2">🏫</span>
                    Todas las escuelas
                    {!selectedSchool && <span className="float-end">✓</span>}
                  </button>
                  
                  {escuelas.map(escuela => (
                    <button
                      key={escuela.id}
                      className={`btn btn-sm w-100 mb-1 text-start ${
                        selectedSchool === escuela.id ? 'btn-success' : 'btn-outline-secondary'
                      }`}
                      onClick={() => onSchoolSelect(escuela.id)}
                    >
                      <span className="me-2">🏫</span>
                      {escuela.nombre}
                      {selectedSchool === escuela.id && <span className="float-end">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Barra de búsqueda */}
          <div className="search-input-container flex-grow-1">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Buscar jugador..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="btn btn-sm search-clear"
                onClick={() => onSearchChange('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        {/* Mostrar filtros activos */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {selectedCategory && (
            <span className="badge bg-primary d-flex align-items-center">
              <span>📋 {getSelectedCategoryName()}</span>
              <button 
                className="btn btn-sm p-0 ms-2 text-white border-0 bg-transparent"
                onClick={onClearCategory}
                style={{ fontSize: '12px', lineHeight: '1' }}
              >
                ✕
              </button>
            </span>
          )}
          
          {selectedSchool && (
            <span className="badge bg-success d-flex align-items-center">
              <span>🏫 {getSelectedSchoolName()}</span>
              <button 
                className="btn btn-sm p-0 ms-2 text-white border-0 bg-transparent"
                onClick={onClearSchool}
                style={{ fontSize: '12px', lineHeight: '1' }}
              >
                ✕
              </button>
            </span>
          )}
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="stats-section mb-3">
          <div className="small text-muted">
            {selectedCategory || selectedSchool || searchTerm ? (
              <>
                Mostrando: <strong>{filteredPlayers.length}</strong> de {players.length} jugadores
              </>
            ) : (
              <>
                Total jugadores: <strong>{filteredPlayers.length}</strong>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="players-list">
        {filteredPlayers.map((player) => (
          <AdminPlayerItem
            key={player.id}
            player={player}
            onClick={onPlayerClick}
          />
        ))}
        
        {filteredPlayers.length === 0 && !loading && (
          <div className="text-center py-4">
            <div className="text-muted">
              {selectedCategory || selectedSchool || searchTerm ? 
                'No se encontraron jugadores con los filtros aplicados' : 
                'No hay jugadores registrados en el sistema'
              }
              {(selectedCategory || selectedSchool || searchTerm) && (
                <div className="mt-2">
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      onSearchChange('');
                      onClearCategory();
                      onClearSchool();
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
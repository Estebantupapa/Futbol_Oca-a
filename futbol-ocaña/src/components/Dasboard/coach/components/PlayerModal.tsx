import React from 'react';
import { PlayerModalProps } from '../types/coachTypes';

const PlayerModal: React.FC<PlayerModalProps> = ({
  player,
  originalPlayer,
  isEditing,
  isSaving,
  documentOpened,
  categorias,
  escuelas,
  paises,
  departamentos,
  ciudades,
  editPaises,
  editDepartamentos,
  editCiudades,
  editSelectedPaisId,
  editSelectedDepartamentoId,
  onClose,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  onInputChange,
  onPrint,
  onDownloadID,
  onDownloadRegister,
  onDocumentOpen,
  onLoadEditDepartamentos,
  onLoadEditCiudades
}) => {
  if (!player) return null;

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <div className={`modal-overlay ${documentOpened ? 'document-open' : ''}`} onClick={onClose}>
      <div className="player-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            INFORMACIÓN DEL JUGADOR
            {isSaving && (
              <span className="ms-2">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Guardando...</span>
                </div>
              </span>
            )}
          </h3>
          <div className="d-flex align-items-center">
            {!isEditing ? (
              <button 
                className="btn btn-sm btn-outline-primary me-2"
                onClick={onEdit}
                disabled={isSaving || documentOpened}
              >
                ✏️ Editar
              </button>
            ) : (
              <>
                <button 
                  className="btn btn-sm btn-success me-2"
                  onClick={onSave}
                  disabled={isSaving || documentOpened}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Guardando...
                    </>
                  ) : (
                    <>💾 Guardar</>
                  )}
                </button>
                <button 
                  className="btn btn-sm btn-secondary me-2"
                  onClick={onCancelEdit}
                  disabled={isSaving || documentOpened}
                >
                  ✕ Cancelar
                </button>
              </>
            )}
            <button 
              className="btn btn-sm btn-danger me-2"
              onClick={() => onDelete(player.id)}
              disabled={isSaving || documentOpened}
            >
              🗑️ Eliminar
            </button>
            <button 
              className="close-button" 
              onClick={onClose}
              disabled={isSaving}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="row">
            <div className="col-md-4">
              <div className="photo-section">
                <h5>FOTO</h5>
                <div className="photo-container">
                  {player.foto_perfil_url ? (
                    <img 
                      src={player.foto_perfil_url} 
                      alt={`${player.nombre} ${player.apellido}`}
                      className="player-photo"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div 
                    className="player-photo-placeholder" 
                    style={player.foto_perfil_url ? {display: 'none'} : {}}
                  >
                    👤
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      Edad: {calculateAge(player.fecha_nacimiento)} años
                    </small>
                  </div>
                  {isEditing && (
                    <div className="mt-2">
                      <small className="text-info">
                        💡 Recuerda guardar los cambios
                      </small>
                    </div>
                  )}
                </div>

                <div className="documents-section mt-4">
                  <h5>DOCUMENTOS</h5>
                  <div className="document-links">
                    {player.documento_pdf_url && (
                      <div className="document-item mb-2">
                        <button
                          className="btn btn-sm btn-outline-primary w-100"
                          onClick={() => onDocumentOpen(
                            player.documento_pdf_url!, 
                            `Documento_${player.nombre}_${player.apellido}.pdf`
                          )}
                          disabled={documentOpened}
                        >
                          📄 Ver Documento de Identidad
                          {documentOpened && (
                            <span className="ms-2 spinner-border spinner-border-sm" role="status"></span>
                          )}
                        </button>
                      </div>
                    )}
                    {player.registro_civil_url && (
                      <div className="document-item mb-2">
                        <button
                          className="btn btn-sm btn-outline-secondary w-100"
                          onClick={() => onDocumentOpen(
                            player.registro_civil_url!, 
                            `Registro_Civil_${player.nombre}_${player.apellido}.pdf`
                          )}
                          disabled={documentOpened}
                        >
                          📋 Ver Registro Civil
                          {documentOpened && (
                            <span className="ms-2 spinner-border spinner-border-sm" role="status"></span>
                          )}
                        </button>
                      </div>
                    )}
                    {!player.documento_pdf_url && !player.registro_civil_url && (
                      <small className="text-muted">No hay documentos disponibles</small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="info-section">
                <div className="info-field">
                  <label>DOCUMENTO</label>
                  <input 
                    type="text" 
                    value={player.documento} 
                    readOnly 
                    className="form-control readonly-input"
                  />
                  <small className="text-muted">El documento no se puede modificar</small>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="info-field">
                      <label>NOMBRE</label>
                      <input 
                        type="text" 
                        name="nombre"
                        value={player.nombre} 
                        onChange={onInputChange}
                        readOnly={!isEditing}
                        className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-field">
                      <label>APELLIDO</label>
                      <input 
                        type="text" 
                        name="apellido"
                        value={player.apellido} 
                        onChange={onInputChange}
                        readOnly={!isEditing}
                        className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="info-field">
                  <label>FECHA DE NACIMIENTO</label>
                  <input 
                    type="date" 
                    name="fecha_nacimiento"
                    value={player.fecha_nacimiento} 
                    onChange={onInputChange}
                    readOnly={!isEditing}
                    className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                  />
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="info-field">
                      <label>PAÍS</label>
                      {isEditing ? (
                        <select
                          name="pais"
                          value={player.pais}
                          onChange={onInputChange}
                          className="form-control"
                        >
                          <option value="">Seleccione un país</option>
                          {editPaises.map(pais => (
                            <option key={pais.id} value={pais.nombre}>{pais.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={player.pais} 
                          readOnly 
                          className="form-control readonly-input"
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="info-field">
                      <label>DEPARTAMENTO</label>
                      {isEditing ? (
                        <select
                          name="departamento"
                          value={player.departamento}
                          onChange={onInputChange}
                          className="form-control"
                          disabled={!editSelectedPaisId}
                        >
                          <option value="">
                            {!editSelectedPaisId ? 'Seleccione primero un país' : 'Seleccione un departamento'}
                          </option>
                          {editDepartamentos.map(depto => (
                            <option key={depto.id} value={depto.nombre}>{depto.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={player.departamento} 
                          readOnly 
                          className="form-control readonly-input"
                        />
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="info-field">
                      <label>CIUDAD</label>
                      {isEditing ? (
                        <select
                          name="ciudad"
                          value={player.ciudad}
                          onChange={onInputChange}
                          className="form-control"
                          disabled={!editSelectedDepartamentoId}
                        >
                          <option value="">
                            {!editSelectedDepartamentoId ? 'Seleccione primero un departamento' : 'Seleccione una ciudad'}
                          </option>
                          {editCiudades.map(ciudad => (
                            <option key={ciudad.id} value={ciudad.nombre}>{ciudad.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={player.ciudad} 
                          readOnly 
                          className="form-control readonly-input"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="info-field">
                  <label>CATEGORÍA</label>
                  <input 
                    type="text" 
                    value={player.categoria?.nombre || 'Sin categoría'} 
                    readOnly 
                    className="form-control readonly-input"
                  />
                  <small className="text-muted">La categoría no se puede modificar desde aquí</small>
                </div>

                <div className="info-field">
                  <label>CLUB O ESCUELA</label>
                  <input 
                    type="text" 
                    value={player.escuela?.nombre || 'Sin escuela'} 
                    readOnly 
                    className="form-control readonly-input"
                  />
                  <small className="text-muted">La escuela no se puede modificar desde aquí</small>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="info-field">
                      <label>EPS</label>
                      <input 
                        type="text" 
                        name="eps"
                        value={player.eps} 
                        onChange={onInputChange}
                        readOnly={!isEditing}
                        className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-field">
                      <label>TIPO DE EPS</label>
                      {isEditing ? (
                        <select 
                          name="tipo_eps"
                          value={player.tipo_eps} 
                          onChange={onInputChange}
                          className="form-control"
                        >
                          <option value="Subsidiado">Subsidiado</option>
                          <option value="Contributivo">Contributivo</option>
                          <option value="Especial">Especial</option>
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={player.tipo_eps} 
                          readOnly 
                          className="form-control readonly-input"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              className="btn btn-primary action-btn"
              onClick={onPrint}
              disabled={isSaving || documentOpened}
              title="Imprimir información del jugador"
            >
              🖨️ IMPRIMIR
            </button>
            <button 
              className="btn btn-success action-btn"
              onClick={onDownloadRegister}
              disabled={isSaving || documentOpened}
              title="Descargar registro o documento oficial"
            >
              ⬇️ DESCARGAR REGISTRO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerModal;
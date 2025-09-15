import React from 'react';
import FileUploader from '../../../shared/components/fileUpload';
import { AddPlayerModalProps } from '../types/coachTypes';
import { PlayerFiles } from '../../../../services/supabaseClient';

const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  show,
  newPlayer,
  paises,
  departamentos,
  ciudades,
  categorias,
  escuelas,
  selectedPaisId,
  selectedDepartamentoId,
  currentUser,
  isUploading,
  fileErrors,
  onClose,
  onSubmit,
  onInputChange,
  onFileSelect,
  onLoadDepartamentos,
  onLoadCiudades
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-player-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            AGREGAR NUEVO JUGADOR
            {isUploading && (
              <span className="ms-2">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Subiendo archivos...</span>
                </div>
              </span>
            )}
          </h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={onSubmit}>
            {/* Sección de archivos */}
            <div className="files-section mb-4">
              <h5 className="mb-3">📁 ARCHIVOS DEL JUGADOR</h5>
              
              <div className="row">
                <div className="col-md-4">
                  <FileUploader
                    type="photo"
                    label="Foto de Perfil"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    maxSize="5"
                    onFileSelect={(file) => onFileSelect('foto_perfil', file)}
                    currentFile={null}
                    error={fileErrors.foto_perfil}
                    required={true}
                  />
                </div>
                
                <div className="col-md-4">
                  <FileUploader
                    type="document"
                    label="Documento de Identidad (PDF)"
                    accept="application/pdf"
                    maxSize="10"
                    onFileSelect={(file) => onFileSelect('documento_pdf', file)}
                    currentFile={null}
                    error={fileErrors.documento_pdf}
                  />
                </div>
                
                <div className="col-md-4">
                  <FileUploader
                    type="registro"
                    label="Registro Civil (PDF)"
                    accept="application/pdf"
                    maxSize="10"
                    onFileSelect={(file) => onFileSelect('registro_civil', file)}
                    currentFile={null}
                    error={fileErrors.registro_civil}
                  />
                </div>
              </div>
            </div>

            <hr />

            {/* Datos personales */}
            <h5 className="mb-3">👤 DATOS PERSONALES</h5>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="documento" className="form-label">
                    Documento <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="documento"
                    name="documento"
                    value={newPlayer.documento || ''}
                    onChange={onInputChange}
                    placeholder="123456789"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="fecha_nacimiento" className="form-label">
                    Fecha de Nacimiento <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    value={newPlayer.fecha_nacimiento || ''}
                    onChange={onInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">
                    Nombre <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    name="nombre"
                    value={newPlayer.nombre || ''}
                    onChange={onInputChange}
                    placeholder="Nombre del jugador"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="apellido" className="form-label">
                    Apellido <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="apellido"
                    name="apellido"
                    value={newPlayer.apellido || ''}
                    onChange={onInputChange}
                    placeholder="Apellido del jugador"
                    required
                  />
                </div>
              </div>
            </div>

            <hr />

            <h5 className="mb-3">📍 UBICACIÓN</h5>
            
            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="pais" className="form-label">
                    País <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    id="pais"
                    name="pais"
                    value={newPlayer.pais || ''}
                    onChange={onInputChange}
                    required
                  >
                    <option value="">Seleccione un país</option>
                    {paises.map(pais => (
                      <option key={pais.id} value={pais.nombre}>{pais.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="departamento" className="form-label">
                    Departamento <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    id="departamento"
                    name="departamento"
                    value={newPlayer.departamento || ''}
                    onChange={onInputChange}
                    disabled={!selectedPaisId}
                    required
                  >
                    <option value="">
                      {!selectedPaisId ? 'Seleccione primero un país' : 'Seleccione un departamento'}
                    </option>
                    {departamentos.map(depto => (
                      <option key={depto.id} value={depto.nombre}>{depto.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="ciudad" className="form-label">
                    Ciudad <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    id="ciudad"
                    name="ciudad"
                    value={newPlayer.ciudad || ''}
                    onChange={onInputChange}
                    disabled={!selectedDepartamentoId}
                    required
                  >
                    <option value="">
                      {!selectedDepartamentoId ? 'Seleccione primero un departamento' : 'Seleccione una ciudad'}
                    </option>
                    {ciudades.map(ciudad => (
                      <option key={ciudad.id} value={ciudad.nombre}>{ciudad.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr />

            <h5 className="mb-3">⚽ INFORMACIÓN DEPORTIVA</h5>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="categoria_id" className="form-label">
                    Categoría <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    id="categoria_id"
                    name="categoria_id"
                    value={newPlayer.categoria_id || ''}
                    onChange={onInputChange}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="escuela_id" className="form-label">
                    Club o Escuela <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    id="escuela_id"
                    name="escuela_id"
                    value={newPlayer.escuela_id || ''}
                    onChange={onInputChange}
                    disabled={currentUser.rol === 'entrenador'}
                    required
                  >
                    <option value="">Seleccione una escuela</option>
                    {escuelas.map(escuela => (
                      <option key={escuela.id} value={escuela.id}>{escuela.nombre}</option>
                    ))}
                  </select>
                  {currentUser.rol === 'entrenador' && (
                    <small className="text-muted">
                      Solo puedes agregar jugadores a tu escuela asignada
                    </small>
                  )}
                </div>
              </div>
            </div>

            <hr />

            <h5 className="mb-3">🏥 INFORMACIÓN MÉDICA</h5>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="eps" className="form-label">
                    EPS <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="eps"
                    name="eps"
                    value={newPlayer.eps || ''}
                    onChange={onInputChange}
                    placeholder="Nueva EPS"
                    required
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="tipo_eps" className="form-label">
                    Tipo de EPS <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    id="tipo_eps"
                    name="tipo_eps"
                    value={newPlayer.tipo_eps || 'Subsidiado'}
                    onChange={onInputChange}
                    required
                  >
                    <option value="Subsidiado">Subsidiado</option>
                    <option value="Contributivo">Contributivo</option>
                    <option value="Especial">Especial</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="submit" 
                className="btn btn-success action-btn"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creando Jugador...
                  </>
                ) : (
                  <>✅ Crear Jugador</>
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary action-btn"
                onClick={onClose}
                disabled={isUploading}
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPlayerModal;
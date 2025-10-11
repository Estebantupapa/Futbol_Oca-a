import React from 'react';
import { Jugador, Categoria, Escuela } from '../../../services/supabaseClient';

interface AdminPlayerModalProps {
  player: Jugador;
  categorias: Categoria[];
  escuelas: Escuela[];
  onClose: () => void;
  onPrint: () => void;
  onDownloadID: () => void;
  onDownloadRegister: () => void;
  onDocumentOpen: (url: string, filename: string) => void;
}

const AdminPlayerModal: React.FC<AdminPlayerModalProps> = ({
  player,
  categorias,
  escuelas,
  onClose,
  onPrint,
  onDownloadID,
  onDownloadRegister,
  onDocumentOpen
}) => {
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

  const getCategoriaName = () => {
    return categorias.find(cat => cat.id === player.categoria_id)?.nombre || 'Sin categoría';
  };

  const getEscuelaName = () => {
    return escuelas.find(esc => esc.id === player.escuela_id)?.nombre || 'Sin escuela';
  };

  const handlePhotoClick = () => {
    if (player.foto_perfil_url) {
      onDocumentOpen(player.foto_perfil_url, `Foto_${player.nombre}_${player.apellido}.jpg`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="player-modal admin-player-modal">
        <div className="modal-header">
          <h5 className="modal-title">
            👤 Información del Jugador - {player.nombre} {player.apellido}
          </h5>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="row">
            {/* Foto del jugador */}
            <div className="col-md-4">
              <div className="photo-section">
                <h5>FOTO DE PERFIL</h5>
                <div className="photo-container">
                  {player.foto_perfil_url ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={player.foto_perfil_url} 
                        alt={`${player.nombre} ${player.apellido}`}
                        className="player-photo"
                        onClick={handlePhotoClick}
                        style={{ cursor: 'pointer' }}
                      />
                      <button 
                        className="photo-search-btn"
                        onClick={handlePhotoClick}
                        title="Ver foto en tamaño completo"
                      >
                        🔍
                      </button>
                    </div>
                  ) : (
                    <div className="photo-placeholder">
                      👤
                    </div>
                  )}
                </div>
                
                {/* Información básica de la foto */}
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    {player.foto_perfil_url ? 
                      'Haz clic en la foto para verla en tamaño completo' : 
                      'No hay foto de perfil disponible'
                    }
                  </small>
                </div>
              </div>
            </div>
            
            {/* Información del jugador */}
            <div className="col-md-8">
              <div className="info-section">
                {/* Documento */}
                <div className="info-field">
                  <label>📄 DOCUMENTO DE IDENTIDAD</label>
                  <div className="readonly-input form-control">{player.documento}</div>
                </div>
                
                {/* Nombre y Apellido */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="info-field">
                      <label>👤 NOMBRE</label>
                      <div className="readonly-input form-control">{player.nombre}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-field">
                      <label>👤 APELLIDO</label>
                      <div className="readonly-input form-control">{player.apellido}</div>
                    </div>
                  </div>
                </div>
                
                {/* Fecha de Nacimiento y Categoría */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="info-field">
                      <label>🎂 FECHA DE NACIMIENTO</label>
                      <div className="readonly-input form-control">
                        {formatDate(player.fecha_nacimiento)} 
                        <br />
                        <small className="text-muted">
                          ({calculateAge(player.fecha_nacimiento)} años)
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-field">
                      <label>⚽ CATEGORÍA</label>
                      <div className="readonly-input form-control">{getCategoriaName()}</div>
                    </div>
                  </div>
                </div>
                
                {/* Escuela */}
                <div className="info-field">
                  <label>🏫 ESCUELA</label>
                  <div className="readonly-input form-control">{getEscuelaName()}</div>
                </div>
                
                {/* Información Médica */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="info-field">
                      <label>🏥 EPS</label>
                      <div className="readonly-input form-control">{player.eps || 'No especificada'}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="info-field">
                      <label>📋 TIPO DE EPS</label>
                      <div className="readonly-input form-control">{player.tipo_eps || 'No especificado'}</div>
                    </div>
                  </div>
                </div>
                
                {/* Ubicación */}
                <div className="row">
                  <div className="col-md-4">
                    <div className="info-field">
                      <label>🌎 PAÍS</label>
                      <div className="readonly-input form-control">{player.pais || 'No especificado'}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="info-field">
                      <label>📍 DEPARTAMENTO</label>
                      <div className="readonly-input form-control">{player.departamento || 'No especificado'}</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="info-field">
                      <label>🏙️ CIUDAD</label>
                      <div className="readonly-input form-control">{player.ciudad || 'No especificado'}</div>
                    </div>
                  </div>
                </div>

                {/* Estado del jugador */}
                <div className="info-field">
                  <label>📊 ESTADO</label>
                  <div className="readonly-input form-control">
                    <span className={`badge ${player.activo ? 'bg-success' : 'bg-secondary'}`}>
                      {player.activo ? '✅ ACTIVO' : '❌ INACTIVO'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sección de documentos */}
          <div className="documents-section mt-4">
            <h5>📁 DOCUMENTOS ADJUNTOS</h5>
            <div className="document-buttons">
              {player.documento_pdf_url ? (
                <button
                  className="btn btn-info"
                  onClick={() => onDocumentOpen(player.documento_pdf_url!, `Documento_${player.documento}.pdf`)}
                >
                  📄 Ver Documento PDF
                </button>
              ) : (
                <button className="btn btn-outline-secondary" disabled>
                  📄 Sin Documento PDF
                </button>
              )}
              
              {player.registro_civil_url ? (
                <button
                  className="btn btn-warning"
                  onClick={() => onDocumentOpen(player.registro_civil_url!, `Registro_Civil_${player.documento}.pdf`)}
                >
                  📋 Ver Registro Civil
                </button>
              ) : (
                <button className="btn btn-outline-secondary" disabled>
                  📋 Sin Registro Civil
                </button>
              )}
              
              <button
                className="btn btn-success"
                onClick={onDownloadRegister}
                disabled={!player.documento_pdf_url && !player.registro_civil_url}
              >
                ⬇️ Descargar Documentos
              </button>
              
              <button
                className="btn btn-primary"
                onClick={onPrint}
              >
                🖨️ Imprimir Información
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={onDownloadID}
                disabled={!player.foto_perfil_url}
              >
                🆔 Generar Identificación
              </button>
            </div>

            {/* Información de documentos disponibles */}
            <div className="mt-2">
              <small className="text-muted">
                Documentos disponibles: 
                {player.documento_pdf_url && ' 📄 Documento PDF'}
                {player.registro_civil_url && ' 📋 Registro Civil'}
                {!player.documento_pdf_url && !player.registro_civil_url && ' Ninguno'}
              </small>
            </div>
          </div>
          
          {/* Información de estado */}
          <div className="alert alert-info mt-3">
            <small>
              <strong>👁️ Modo de solo lectura:</strong> Como administrador, puedes ver toda la información del jugador pero no editarla. 
              Los entrenadores son responsables de gestionar los datos de sus jugadores.
            </small>
          </div>
        </div>
        
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary action-btn"
            onClick={onClose}
          >
            ✕ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPlayerModal;
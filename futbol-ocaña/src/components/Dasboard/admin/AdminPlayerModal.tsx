import React, { useState, useEffect } from 'react';
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
  onDocumentOpen
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Reset image states cuando cambia el jugador
    setImageError(false);
    setImageLoaded(false);
  }, [player]);

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

  const handleDocumentOpen = (url: string, filename: string) => {
    onDocumentOpen(url, filename);
  };

  const handleDownloadDocuments = async () => {
    try {
      let documentsOpened = 0;

      if (player.documento_pdf_url) {
        window.open(player.documento_pdf_url, '_blank');
        documentsOpened++;
      }

      if (player.registro_civil_url) {
        window.open(player.registro_civil_url, '_blank');
        documentsOpened++;
      }

      if (documentsOpened > 0) {
        setTimeout(() => {
          alert(`✅ Se abrieron ${documentsOpened} documento(s) en nuevas pestañas`);
        }, 500);
      } else {
        alert('⚠️ No hay documentos disponibles para visualizar');
      }
    } catch (error) {
      console.error('Error al abrir documentos:', error);
      alert('❌ Error al abrir los documentos');
    }
  };

  // Función para forzar la recarga de la imagen
  const reloadImage = () => {
    setImageError(false);
    setImageLoaded(false);
  };

  return (
    <div className="player-modal-overlay" onClick={onClose}>
      <div className="player-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="player-modal-header">
          <h3 className="player-modal-title">
            INFORMACIÓN DEL JUGADOR - VISTA ADMINISTRADOR
          </h3>
          <button className="player-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="player-modal-body">
          {/* Header con foto e información básica */}
          <div className="player-header-info">
            <div className="player-photo-wrapper">
              {player.foto_perfil_url && !imageError ? (
                <>
                  <img 
                    src={`${player.foto_perfil_url}?t=${Date.now()}`} 
                    alt={`${player.nombre} ${player.apellido}`}
                    className="player-main-photo"
                    onError={() => {
                      console.error("Error cargando la imagen:", player.foto_perfil_url);
                      setImageError(true);
                    }}
                    onLoad={() => setImageLoaded(true)}
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                  />
                  {!imageLoaded && !imageError && (
                    <div className="player-photo-loading">Cargando...</div>
                  )}
                </>
              ) : (
                <div className="player-photo-fallback">
                  👤
                  {player.foto_perfil_url && imageError && (
                    <div className="player-photo-error">
                      <p>Error al cargar la imagen</p>
                      <button onClick={reloadImage}>Reintentar</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="player-basic-details">
              <h2 className="player-fullname">{player.nombre} {player.apellido}</h2>
              <div className="player-info-grid">
                <div className="player-info-item">
                  <span className="player-info-label">Documento:</span>
                  <span className="player-info-value">{player.documento}</span>
                </div>
                <div className="player-info-item">
                  <span className="player-info-label">Edad:</span>
                  <span className="player-info-value">{calculateAge(player.fecha_nacimiento)} años</span>
                </div>
                <div className="player-info-item">
                  <span className="player-info-label">Nacimiento:</span>
                  <span className="player-info-value">{formatDate(player.fecha_nacimiento)}</span>
                </div>
                <div className="player-info-item">
                  <span className="player-info-label">Categoría:</span>
                  <span className="player-info-value">{getCategoriaName()}</span>
                </div>
                <div className="player-info-item">
                  <span className="player-info-label">Escuela:</span>
                  <span className="player-info-value">{getEscuelaName()}</span>
                </div>
                <div className="player-info-item">
                  <span className="player-info-label">Estado:</span>
                  <span className={`player-status-badge ${player.activo ? 'active' : 'inactive'}`}>
                    {player.activo ? '✅ ACTIVO' : '❌ INACTIVO'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de ubicación y médica */}
          <div className="player-readonly-info">
            <div className="player-info-section">
              <h4 className="player-section-title">📍 Ubicación</h4>
              <div className="player-info-grid-readonly">
                <div className="player-info-item-readonly">
                  <span className="player-info-label-readonly">País:</span>
                  <span className="player-info-value-readonly">{player.pais || 'No especificado'}</span>
                </div>
                <div className="player-info-item-readonly">
                  <span className="player-info-label-readonly">Departamento:</span>
                  <span className="player-info-value-readonly">{player.departamento || 'No especificado'}</span>
                </div>
                <div className="player-info-item-readonly">
                  <span className="player-info-label-readonly">Ciudad:</span>
                  <span className="player-info-value-readonly">{player.ciudad || 'No especificado'}</span>
                </div>
              </div>
            </div>

            <div className="player-info-section">
              <h4 className="player-section-title">🏥 Información Médica</h4>
              <div className="player-info-grid-readonly">
                <div className="player-info-item-readonly">
                  <span className="player-info-label-readonly">EPS:</span>
                  <span className="player-info-value-readonly">{player.eps || 'No especificada'}</span>
                </div>
                <div className="player-info-item-readonly">
                  <span className="player-info-label-readonly">Tipo de EPS:</span>
                  <span className="player-info-value-readonly">{player.tipo_eps || 'No especificado'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className="player-documents-section">
            <h4 className="player-section-title">📁 Documentos</h4>
            <div className="player-document-buttons">
              {player.documento_pdf_url && (
                <button
                  className="player-doc-btn"
                  onClick={() => handleDocumentOpen(player.documento_pdf_url!, `Documento_${player.documento}.pdf`)}
                >
                  <span className="player-doc-icon">📄</span>
                  <span className="player-doc-text">Ver Documento de Identidad</span>
                </button>
              )}
              {player.registro_civil_url && (
                <button
                  className="player-doc-btn"
                  onClick={() => handleDocumentOpen(player.registro_civil_url!, `Registro_Civil_${player.documento}.pdf`)}
                >
                  <span className="player-doc-icon">📋</span>
                  <span className="player-doc-text">Ver Registro Civil</span>
                </button>
              )}
              {!player.documento_pdf_url && !player.registro_civil_url && (
                <p className="player-no-docs">No hay documentos disponibles</p>
              )}
            </div>
          </div>

          {/* Información de administrador */}
          <div className="admin-info-notice">
            <div className="admin-notice-content">
              <span className="admin-notice-icon">👁️</span>
              <div className="admin-notice-text">
                <strong>Modo de solo lectura:</strong> Como administrador, puedes ver toda la información del jugador pero no editarla. 
                Los entrenadores son responsables de gestionar los datos de sus jugadores.
              </div>
            </div>
          </div>
        </div>

        <div className="player-modal-actions">
          <button className="player-action-btn player-print-btn" onClick={onPrint}>
            🖨️ Imprimir
          </button>
          {(player.documento_pdf_url || player.registro_civil_url) && (
            <button className="player-action-btn player-download-docs-btn" onClick={handleDownloadDocuments}>
              📄 Descargar Documentos
            </button>
          )}
          <button className="player-action-btn player-close-action-btn" onClick={onClose}>
            ✕ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPlayerModal;
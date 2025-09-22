import React, { useState, useEffect } from 'react';
import { PlayerModalProps } from '../types/coachTypes';
import './PlayerModal.css';

const PlayerModal: React.FC<PlayerModalProps> = ({
    player,
    originalPlayer,
    isEditing,
    isSaving,
    categorias,
    escuelas,
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
    //onDownloadID,
    onDownloadRegister,
    onDocumentOpen,
    onLoadEditDepartamentos,
    onLoadEditCiudades
}) => {
    if (!player) return null;

    const [/*localEditPais*/, setLocalEditPais] = useState('');
    const [/*localEditDepartamento*/, setLocalEditDepartamento] = useState('');
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        if (player.pais) {
            setLocalEditPais(player.pais);
        }
        if (player.departamento) {
            setLocalEditDepartamento(player.departamento);
        }
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

    const handlePaisChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        onInputChange(e);
        
        const selectedPais = editPaises.find(p => p.nombre === value);
        if (selectedPais) {
            await onLoadEditDepartamentos(selectedPais.id);
        }
    };

    const handleDepartamentoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        onInputChange(e);
        
        const selectedDepto = editDepartamentos.find(d => d.nombre === value);
        if (selectedDepto) {
            await onLoadEditCiudades(selectedDepto.id);
        }
    };

    const hasChanges = () => {
        if (!originalPlayer) return false;
        return (
            player.nombre !== originalPlayer.nombre ||
            player.apellido !== originalPlayer.apellido ||
            player.fecha_nacimiento !== originalPlayer.fecha_nacimiento ||
            player.pais !== originalPlayer.pais ||
            player.departamento !== originalPlayer.departamento ||
            player.ciudad !== originalPlayer.ciudad ||
            player.eps !== originalPlayer.eps ||
            player.tipo_eps !== originalPlayer.tipo_eps
        );
    };

    const handleDocumentOpen = (url: string, filename: string) => {
        if (onDocumentOpen) {
            onDocumentOpen(url, filename);
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
                        {isEditing ? 'EDITAR JUGADOR' : 'INFORMACIÓN DEL JUGADOR'}
                        {isEditing && hasChanges() && <span className="player-changes-indicator">* Cambios pendientes</span>}
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
                                    <span className="player-info-value">{categorias.find(cat => cat.id === player.categoria_id)?.nombre || 'Sin categoría'}</span>
                                </div>
                                <div className="player-info-item">
                                    <span className="player-info-label">Escuela:</span>
                                    <span className="player-info-value">{escuelas.find(esc => esc.id === player.escuela_id)?.nombre || 'Sin escuela'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de edición */}
                    {isEditing && (
                        <div className="player-edit-section">
                            <div className="player-form-section">
                                <h4 className="player-section-title">Datos Personales</h4>
                                <div className="player-form-row">
                                    <div className="player-form-group">
                                        <label className="player-form-label">Nombre</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={player.nombre}
                                            onChange={onInputChange}
                                            className="player-form-input"
                                        />
                                    </div>
                                    <div className="player-form-group">
                                        <label className="player-form-label">Apellido</label>
                                        <input
                                            type="text"
                                            name="apellido"
                                            value={player.apellido}
                                            onChange={onInputChange}
                                            className="player-form-input"
                                        />
                                    </div>
                                </div>

                                <div className="player-form-group">
                                    <label className="player-form-label">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        name="fecha_nacimiento"
                                        value={player.fecha_nacimiento}
                                        onChange={onInputChange}
                                        className="player-form-input"
                                    />
                                </div>
                            </div>

                            <div className="player-form-section">
                                <h4 className="player-section-title">Ubicación</h4>
                                <div className="player-form-row">
                                    <div className="player-form-group">
                                        <label className="player-form-label">País</label>
                                        <select
                                            name="pais"
                                            value={player.pais}
                                            onChange={handlePaisChange}
                                            className="player-form-select"
                                        >
                                            <option value="">Seleccionar país</option>
                                            {editPaises.map(pais => (
                                                <option key={pais.id} value={pais.nombre}>
                                                    {pais.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="player-form-group">
                                        <label className="player-form-label">Departamento</label>
                                        <select
                                            name="departamento"
                                            value={player.departamento}
                                            onChange={handleDepartamentoChange}
                                            className="player-form-select"
                                            disabled={!editSelectedPaisId}
                                        >
                                            <option value="">Seleccionar departamento</option>
                                            {editDepartamentos.map(depto => (
                                                <option key={depto.id} value={depto.nombre}>
                                                    {depto.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="player-form-group">
                                        <label className="player-form-label">Ciudad</label>
                                        <select
                                            name="ciudad"
                                            value={player.ciudad}
                                            onChange={onInputChange}
                                            className="player-form-select"
                                            disabled={!editSelectedDepartamentoId}
                                        >
                                            <option value="">Seleccionar ciudad</option>
                                            {editCiudades.map(ciudad => (
                                                <option key={ciudad.id} value={ciudad.nombre}>
                                                    {ciudad.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="player-form-section">
                                <h4 className="player-section-title">Información Médica</h4>
                                <div className="player-form-row">
                                    <div className="player-form-group">
                                        <label className="player-form-label">EPS</label>
                                        <input
                                            type="text"
                                            name="eps"
                                            value={player.eps}
                                            onChange={onInputChange}
                                            className="player-form-input"
                                        />
                                    </div>
                                    <div className="player-form-group">
                                        <label className="player-form-label">Tipo de EPS</label>
                                        <select
                                            name="tipo_eps"
                                            value={player.tipo_eps}
                                            onChange={onInputChange}
                                            className="player-form-select"
                                        >
                                            <option value="Subsidiado">Subsidiado</option>
                                            <option value="Contributivo">Contributivo</option>
                                            <option value="Especial">Especial</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información de ubicación y médica (solo lectura) */}
                    {!isEditing && (
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
                                        <span className="player-info-value-readonly">{player.eps || 'No especificado'}</span>
                                    </div>
                                    <div className="player-info-item-readonly">
                                        <span className="player-info-label-readonly">Tipo de EPS:</span>
                                        <span className="player-info-value-readonly">{player.tipo_eps || 'No especificado'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documentos */}
                    <div className="player-documents-section">
                        <h4 className="player-section-title">📁 Documentos</h4>
                        <div className="player-document-buttons">
                            {player.documento_pdf_url && (
                                <button
                                    className="player-doc-btn"
                                    onClick={() => handleDocumentOpen(player.documento_pdf_url!, 'Documento.pdf')}
                                >
                                    <span className="player-doc-icon">📄</span>
                                    <span className="player-doc-text">Ver Documento de Identidad</span>
                                </button>
                            )}
                            {player.registro_civil_url && (
                                <button
                                    className="player-doc-btn"
                                    onClick={() => handleDocumentOpen(player.registro_civil_url!, 'Registro_Civil.pdf')}
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
                </div>

                <div className="player-modal-actions">
                    {!isEditing ? (
                        <>
                            <button className="player-action-btn player-edit-btn" onClick={onEdit}>
                                ✏️ Editar
                            </button>
                            <button className="player-action-btn player-print-btn" onClick={onPrint}>
                                🖨️ Imprimir
                            </button>
                            {(player.documento_pdf_url || player.registro_civil_url) && (
                                <button className="player-action-btn player-download-docs-btn" onClick={onDownloadRegister}>
                                    📄 Descargar Documentos
                                </button>
                            )}
                            <button 
                                className="player-action-btn player-delete-btn" 
                                onClick={() => onDelete(player.id)}
                            >
                                🗑️ Eliminar
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className="player-action-btn player-save-btn" 
                                onClick={onSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <span className="player-spinner"></span>
                                        Guardando...
                                    </>
                                ) : (
                                    '💾 Guardar'
                                )}
                            </button>
                            <button 
                                className="player-action-btn player-cancel-btn" 
                                onClick={onCancelEdit}
                                disabled={isSaving}
                            >
                                ❌ Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerModal;
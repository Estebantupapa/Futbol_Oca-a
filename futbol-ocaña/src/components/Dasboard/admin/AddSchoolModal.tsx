import React, { useState } from 'react';
import { AddSchoolModalProps } from '../coach/types/adminTypes';

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({
  show,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    nombre: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre de la escuela es obligatorio');
      setLoading(false);
      return;
    }

    if (formData.nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        nombre: ''
      });
    } catch (err: any) {
      setError(err.message || 'Error creando escuela');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="add-player-modal">
        <div className="modal-header">
          <h5 className="modal-title">Agregar Nueva Escuela</h5>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="nombre" className="form-label">
                Nombre de la Escuela *
              </label>
              <input
                type="text"
                className="form-control"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Ej: Escuela de Fútbol Ocaña Norte"
              />
            </div>
            
            <div className="alert alert-info">
              <small>
                <strong>Nota:</strong> Una vez creada la escuela, podrás asignarle entrenadores y registrar jugadores para esa escuela.
              </small>
            </div>
            
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary action-btn"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-success action-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creando...
                  </>
                ) : (
                  'Crear Escuela'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSchoolModal;
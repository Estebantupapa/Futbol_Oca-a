import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Jugador, Escuela } from '../../../services/supabaseClient';

interface EditPlayerModalProps {
  show: boolean;
  onHide: () => void;
  player: Jugador | null;
  escuelas: Escuela[];
  onSave: (playerId: string, escuelaId: string) => Promise<void>;
}

const EditPlayerModal: React.FC<EditPlayerModalProps> = ({ 
  show, 
  onHide, 
  player, 
  escuelas, 
  onSave 
}) => {
  const [selectedEscuela, setSelectedEscuela] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (player) {
      setSelectedEscuela(player.escuela_id || '');
    }
  }, [player]);

  const handleSave = async () => {
    if (!player || !selectedEscuela) return;

    setLoading(true);
    setError('');

    try {
      await onSave(player.id, selectedEscuela);
      onHide();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el jugador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Escuela del Jugador</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Jugador</Form.Label>
            <Form.Control 
              type="text" 
              value={player ? `${player.nombre} ${player.apellido}` : ''} 
              disabled 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Documento</Form.Label>
            <Form.Control 
              type="text" 
              value={player?.documento || ''} 
              disabled 
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Escuela *</Form.Label>
            <Form.Select 
              value={selectedEscuela}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEscuela(e.target.value)}
              required
            >
              <option value="">Seleccionar escuela...</option>
              {escuelas.map(escuela => (
                <option key={escuela.id} value={escuela.id}>
                  {escuela.nombre}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Seleccione la nueva escuela para este jugador
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={loading || !selectedEscuela}
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPlayerModal;
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Jugador } from '../../../services/supabaseClient';
import { jsPDF } from 'jspdf';

interface PeaceAndSafeModalProps {
  show: boolean;
  onHide: () => void;
  player: Jugador | null;
}

const PeaceAndSafeModal: React.FC<PeaceAndSafeModalProps> = ({ show, onHide, player }) => {
  const [fromSchool, setFromSchool] = useState('');
  const [toInstitution, setToInstitution] = useState('');

  const generatePDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // Configuración del documento
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CORPORACIÓN DE FÚTBOL OCAÑERO', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO DE TRANSFERENCIA DE JUGADOR', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const text = [
      `La Corporación de Fútbol Ocañero certifica que el jugador ${player?.nombre || ''} ${player?.apellido || ''},`,
      `identificado en nuestros registros deportivos, se encuentra paz y salvo con esta institución y no presenta`,
      `obligaciones pendientes que restrinjan su movilidad entre escuelas o clubes formativos.`,
      ``,
      `En consecuencia, la Corporación autoriza de manera oficial la transferencia del jugador desde la escuela o`,
      `club ${fromSchool || '__________________________'} hacia la institución deportiva ${toInstitution || '__________________________'},`,
      `garantizando así la continuidad de su proceso formativo y deportivo.`,
      ``,
      `Este certificado se expide a solicitud de la parte interesada para los fines que estime convenientes.`,
      ``,
      `Dado en Ocaña, a los ${day} / ${month} / ${year}.`,
      ``,
      ``,
      `__________________________________`,
      `Corporación de Fútbol Ocañero`,
      `Dirección Administrativa`
    ];

    let yPosition = 50;
    text.forEach(line => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });

    // Guardar el PDF
    const fileName = `paz-y-salvo-${player?.nombre}-${player?.apellido}.pdf`.replace(/\s+/g, '-');
    doc.save(fileName);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Generar Paz y Salvo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Jugador seleccionado</Form.Label>
            <Form.Control 
              type="text" 
              value={player ? `${player.nombre} ${player.apellido} - ${player.documento}` : 'Ningún jugador seleccionado'} 
              disabled 
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Escuela/Club de origen *</Form.Label>
            <Form.Control 
              type="text" 
              value={fromSchool}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFromSchool(e.target.value)}
              placeholder="Ingrese la escuela o club de origen del jugador"
              required
            />
            <Form.Text className="text-muted">
              Nombre de la escuela o club donde actualmente está registrado el jugador
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Institución destino *</Form.Label>
            <Form.Control 
              type="text" 
              value={toInstitution}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToInstitution(e.target.value)}
              placeholder="Ingrese la institución destino (puede ser 'Libre')"
              required
            />
            <Form.Text className="text-muted">
              Nombre de la nueva institución o "Libre" si no tiene destino específico
            </Form.Text>
          </Form.Group>
        </Form>
        
        <div className="border p-3 mt-3 bg-light">
          <h6 className="text-center mb-3">Vista previa del certificado</h6>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.4'
          }}>
{`CORPORACIÓN DE FÚTBOL OCAÑERO
CERTIFICADO DE TRANSFERENCIA DE JUGADOR

La Corporación de Fútbol Ocañero certifica que el jugador ${player?.nombre || '__________________________'} ${player?.apellido || ''}, identificado en nuestros registros deportivos, se encuentra paz y salvo con esta institución y no presenta obligaciones pendientes que restrinjan su movilidad entre escuelas o clubes formativos.

En consecuencia, la Corporación autoriza de manera oficial la transferencia del jugador desde la escuela o club ${fromSchool || '__________________________'} hacia la institución deportiva ${toInstitution || '__________________________'}, garantizando así la continuidad de su proceso formativo y deportivo.

Este certificado se expide a solicitud de la parte interesada para los fines que estime convenientes.

Dado en Ocaña, a los ____ / ____ / ______.

__________________________________
Corporación de Fútbol Ocañero
Dirección Administrativa`}
          </pre>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={generatePDF}
          disabled={!fromSchool || !toInstitution}
        >
          <i className="fas fa-download me-2"></i>
          Exportar a PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PeaceAndSafeModal;
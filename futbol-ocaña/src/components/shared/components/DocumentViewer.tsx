// DocumentViewer.tsx
import React, { useState } from 'react';
import './DocumentViewer.css';

interface DocumentViewerProps {
  url: string;
  filename: string;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ url, filename, onClose }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="document-viewer-overlay" onClick={onClose}>
      <div className="document-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="document-viewer-header">
          <h5>{filename}</h5>
          <button className="btn btn-sm btn-danger" onClick={onClose}>
            ✕ Cerrar
          </button>
        </div>
        
        <div className="document-viewer-body">
          {loading && (
            <div className="document-loading">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando documento...</span>
              </div>
              <p>Cargando documento...</p>
            </div>
          )}
          
          <iframe
            src={url}
            title={filename}
            className="document-iframe"
            onLoad={() => setLoading(false)}
            style={{ display: loading ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
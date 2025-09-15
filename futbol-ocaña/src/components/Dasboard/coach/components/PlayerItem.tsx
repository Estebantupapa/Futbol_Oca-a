import React from 'react';
import { Jugador } from '../../../../services/supabaseClient';
import { PlayerItemProps } from '../types/coachTypes';

const PlayerItem: React.FC<PlayerItemProps> = ({ player, selectedCategory, onClick }) => {
  return (
    <div 
      className="player-item"
      onClick={() => onClick(player)}
    >
      <div className="player-avatar">
        {player.foto_perfil_url ? (
          <img 
            src={player.foto_perfil_url} 
            alt={`${player.nombre} ${player.apellido}`}
            className="avatar-image"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
        <div 
          className="avatar-placeholder" 
          style={player.foto_perfil_url ? {display: 'none'} : {}}
        >
          👤
        </div>
      </div>
      <div className="player-info">
        <div className="player-document">{player.documento}</div>
        <div className="player-name">{player.nombre} {player.apellido}</div>
        <div className="player-category">
          <small className="text-muted">
            {player.categoria?.nombre}
            {selectedCategory && selectedCategory === player.categoria_id && (
              <span className="ms-1 text-primary">📋</span>
            )}
          </small>
        </div>
      </div>
    </div>
  );
};

export default PlayerItem;
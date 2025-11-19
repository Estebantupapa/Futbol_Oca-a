import { useState } from 'react';
import { ExcelPlayerData, ImportResult } from '../types/excel.types';
import { excelImportService } from '../../../../services/excelImportService';
import { excelParser } from '../../../../utils/excelParser';

export const useExcelImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const processExcelFile = async (file: File): Promise<ExcelPlayerData[]> => {
    try {
      console.log('📁 Procesando archivo:', file.name);
      const excelData = await excelParser.parseExcelFile(file);
      console.log('📊 Datos crudos del Excel:', excelData.slice(0, 3));
      
      const players = excelParser.mapToPlayerData(excelData);
      console.log('👥 Jugadores mapeados:', players);
      
      if (players.length === 0) {
        throw new Error('No se encontraron jugadores válidos en el archivo. Verifica el formato.');
      }
      
      return players;
    } catch (error) {
      console.error('❌ Error procesando archivo Excel:', error);
      throw new Error(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const importPlayers = async (players: ExcelPlayerData[], categorias: any[], escuelas: any[]) => {
    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    try {
      console.log(`🚀 Iniciando importación de ${players.length} jugadores`);
      const result = await excelImportService.importPlayers(
        players, 
        categorias, 
        escuelas,
        (progress) => setImportProgress(progress)
      );
      
      setImportResult(result);
      console.log(`✅ Importación completada: ${result.imported}/${result.total}`);
      return result;
    } catch (error) {
      console.error('❌ Error en importación:', error);
      const errorResult: ImportResult = {
        success: false,
        total: players.length,
        imported: 0,
        errors: [`Error durante la importación: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        failedImports: players.map((player, index) => ({
          row: index + 2,
          player,
          error: 'Error general del sistema durante la importación'
        }))
      };
      setImportResult(errorResult);
      throw error;
    } finally {
      setIsImporting(false);
      setImportProgress(100);
    }
  };

  const resetImport = () => {
    setImportResult(null);
    setImportProgress(0);
  };

  return {
    isImporting,
    importProgress,
    importResult,
    processExcelFile,
    importPlayers,
    resetImport
  };
};
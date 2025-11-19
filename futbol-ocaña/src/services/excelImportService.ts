import { ExcelPlayerData, ImportResult/*, FailedImport*/} from '../components/Dasboard/coach/types/excel.types';
import { supabase } from './supabaseClient';

export const excelImportService = {
  validateExcelData(jsonData: any[]): ExcelPlayerData[] {
    console.log('🔍 Validando datos del Excel...');
    console.log('📋 Estructura recibida:', jsonData);
    
    // Si es un array de arrays (estructura de sheet_to_json con header: 1)
    if (Array.isArray(jsonData) && jsonData.length > 0 && Array.isArray(jsonData[0])) {
      console.log('📊 Estructura detectada: Array de arrays');
      // El parser ya se encargará de esto
      return [];
    }
    
    // Si es un array de objetos (estructura de sheet_to_json normal)
    if (Array.isArray(jsonData) && jsonData.length > 0 && typeof jsonData[0] === 'object') {
      console.log('📊 Estructura detectada: Array de objetos');
      console.log('🔑 Campos disponibles:', Object.keys(jsonData[0]));
      
      // Convertir a array de arrays para el parser
      const headers = Object.keys(jsonData[0]);
      const arrayData = jsonData.map((obj: any) => 
        headers.map(header => obj[header])
      );
      arrayData.unshift(headers); // Agregar headers como primera fila
      
      return [];
    }
    
    throw new Error('Formato de datos no reconocido');
  },

  async importPlayers(
    players: ExcelPlayerData[], 
    categorias: any[], 
    escuelas: any[],
    onProgress?: (progress: number) => void
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      total: players.length,
      imported: 0,
      errors: [],
      failedImports: []
    };

    console.log(`🏁 Iniciando importación de ${players.length} jugadores`);
    console.log('🏫 Categorías disponibles:', categorias.map(c => c.nombre));
    console.log('🎓 Escuelas disponibles:', escuelas.map(e => e.nombre));

    for (let i = 0; i < players.length; i++) {
      const playerData = players[i];
      const rowNumber = i + 2; // +2 porque Excel tiene headers y base 1
      
      console.log(`\n👤 Procesando jugador ${i + 1}/${players.length}:`, playerData.nombre, playerData.apellido);

      try {
        // Buscar categoría con coincidencia flexible
        const categoria = categorias.find(cat => {
          const catNombre = cat.nombre.toLowerCase();
          const playerCat = playerData.categoria_nombre.toLowerCase();
          
          const match = catNombre.includes(playerCat) || 
                       playerCat.includes(catNombre) ||
                       catNombre.replace(/[^a-z0-9]/g, '') === playerCat.replace(/[^a-z0-9]/g, '');
          
          if (match) {
            console.log(`✅ Categoría encontrada: "${playerData.categoria_nombre}" -> "${cat.nombre}"`);
          }
          return match;
        });
        
        if (!categoria) {
          throw new Error(`Categoría no encontrada: "${playerData.categoria_nombre}". Disponibles: ${categorias.map(c => c.nombre).join(', ')}`);
        }

        // Buscar escuela con coincidencia flexible  
        const escuela = escuelas.find(esc => {
          const escNombre = esc.nombre.toLowerCase();
          const playerEsc = playerData.escuela_nombre.toLowerCase();
          
          const match = escNombre.includes(playerEsc) || 
                       playerEsc.includes(escNombre) ||
                       escNombre.replace(/[^a-z0-9]/g, '') === playerEsc.replace(/[^a-z0-9]/g, '');
          
          if (match) {
            console.log(`✅ Escuela encontrada: "${playerData.escuela_nombre}" -> "${esc.nombre}"`);
          }
          return match;
        });

        if (!escuela) {
          throw new Error(`Escuela no encontrada: "${playerData.escuela_nombre}". Disponibles: ${escuelas.map(e => e.nombre).join(', ')}`);
        }

        // Verificar si el jugador ya existe
        const { data: existingPlayer, error: checkError } = await supabase
          .from('jugadores')
          .select('id, nombre, apellido')
          .eq('documento', playerData.documento)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no encontrado
          console.error('❌ Error verificando jugador existente:', checkError);
          throw new Error(`Error al verificar jugador: ${checkError.message}`);
        }

        if (existingPlayer) {
          throw new Error(`Jugador con documento ${playerData.documento} ya existe: ${existingPlayer.nombre} ${existingPlayer.apellido}`);
        }

        // Preparar datos para inserción
        const playerToInsert = {
          documento: playerData.documento,
          nombre: playerData.nombre,
          apellido: playerData.apellido,
          fecha_nacimiento: playerData.fecha_nacimiento,
          categoria_id: categoria.id,
          escuela_id: escuela.id,
          ciudad: playerData.ciudad || 'Ocaña',
          departamento: playerData.departamento || 'Norte de Santander',
          eps: playerData.eps || '',
          tipo_eps: playerData.tipo_eps || 'Contributivo',
          pais: playerData.pais || 'Colombia',
          activo: true,
          ciudad_id: null,
          departamento_id: null,
          pais_id: null,
          foto_perfil_url: playerData.foto_perfil_url || null,
          documento_pdf_url: playerData.documento_pdf_url || null,
          registro_civil_url: playerData.registro_civil_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('💾 Insertando jugador en base de datos...');
        const { error: insertError } = await supabase
          .from('jugadores')
          .insert([playerToInsert]);

        if (insertError) {
          console.error('❌ Error detallado al insertar:', insertError);
          throw new Error(`Error al insertar jugador: ${insertError.message}`);
        }

        result.imported++;
        console.log(`✅ Jugador ${playerData.nombre} ${playerData.apellido} importado correctamente`);

      } catch (error) {
        console.error(`❌ Error en fila ${rowNumber}:`, error);
        result.success = false;
        result.failedImports.push({
          row: rowNumber,
          player: playerData,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }

      // Actualizar progreso
      if (onProgress) {
        const progress = Math.round(((i + 1) / players.length) * 100);
        onProgress(progress);
      }
    }

    // Resumen final
    if (result.failedImports.length > 0) {
      result.errors.push(`${result.failedImports.length} jugadores no pudieron ser importados`);
      console.warn(`⚠️  Importación completada con ${result.failedImports.length} errores`);
    } else {
      console.log(`🎉 Importación completada exitosamente: ${result.imported} jugadores importados`);
    }

    return result;
  }
};
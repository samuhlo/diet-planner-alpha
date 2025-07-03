-- Función para eliminar cuenta de usuario
-- Esta función debe ser ejecutada por el usuario autenticado
-- y eliminará todos sus datos de forma segura

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  result json;
BEGIN
  -- Obtener el ID del usuario autenticado
  current_user_id := auth.uid();
  
  -- Verificar que hay un usuario autenticado
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no autenticado'
    );
  END IF;

  BEGIN
    -- Eliminar datos del perfil del usuario
    DELETE FROM user_profiles WHERE user_id = current_user_id;
    
    -- Eliminar otros datos relacionados (agregar tablas según necesites)
    -- DELETE FROM user_plans WHERE user_id = current_user_id;
    -- DELETE FROM user_recipes WHERE user_id = current_user_id;
    
    -- Eliminar el usuario de la tabla auth.users
    -- Nota: Esto requiere privilegios especiales y debe ser manejado por RLS
    DELETE FROM auth.users WHERE id = current_user_id;
    
    RETURN json_build_object(
      'success', true,
      'message', 'Cuenta eliminada exitosamente'
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Si hay algún error, devolver información del error
    RETURN json_build_object(
      'success', false,
      'error', 'Error al eliminar la cuenta: ' || SQLERRM
    );
  END;
END;
$$;

-- Dar permisos a usuarios autenticados para ejecutar esta función
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Comentario para documentar la función
COMMENT ON FUNCTION delete_user_account() IS 'Función para que los usuarios eliminen su propia cuenta y todos los datos asociados'; 
"use server";

import { Trabajador, TrabajadorForm } from "@/types/trabajador";
import { API_BASE_URL } from "../constants";
import { getAuthHeaders, handleApiResponse } from "./helpers";

// Obtener todos los trabajadores
export async function obtenerTrabajadores(): Promise<Trabajador[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    return await handleApiResponse<Trabajador[]>(response);
  } catch (error) {
    console.error("Error obteniendo trabajadores:", error);
    throw error;
  }
}

// Obtener trabajador por ID
export async function obtenerTrabajadorPorId(id: string): Promise<Trabajador> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
      method: "GET",
      headers,
    });
    return await handleApiResponse<Trabajador>(response);
  } catch (error) {
    console.error("Error obteniendo trabajador:", error);
    throw error;
  }
}

// Crear trabajador básico
export async function crearTrabajador(trabajadorData: {
  ci: string;
  nomina: string;
  puesto: string;
  fecha_ingreso: string;
  superintendencia: string;
}) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores`, {
      method: "POST",
      headers,
      body: JSON.stringify(trabajadorData),
    });

    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error creando trabajador:", error);
    throw error;
  }
}

// Crear trabajador con usuario (extiende TrabajadorForm)
export async function crearTrabajadorConUsuario(trabajadorData: {
  ci: string;
  nomina: string;
  puesto: string;
  fecha_ingreso: string;
  superintendencia: string;
  email: string;
  username?: string;
  crear_usuario_keycloak: boolean;
  roles?: string[];
}) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores/with-user`, {
      method: "POST",
      headers,
      body: JSON.stringify(trabajadorData),
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error creando trabajador con usuario:", error);
    throw error;
  }
}

// Actualizar trabajador
export async function actualizarTrabajador(
  id: string,
  data: Partial<TrabajadorForm>
): Promise<Trabajador> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    return await handleApiResponse<Trabajador>(response);
  } catch (error) {
    console.error("Error actualizando trabajador:", error);
    throw error;
  }
}

// Eliminar trabajador
export async function eliminarTrabajador(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores/${id}`, {
      method: "DELETE",
      headers,
    });
    return await handleApiResponse<void>(response);
  } catch (error) {
    console.error("Error eliminando trabajador:", error);
    throw error;
  }
}

// Buscar trabajadores
export async function buscarTrabajadores(query: string): Promise<Trabajador[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/trabajadores/buscar?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );
    return await handleApiResponse<Trabajador[]>(response);
  } catch (error) {
    console.error("Error buscando trabajadores:", error);
    throw error;
  }
}


export async function crearUsuarioParaTrabajadorExistente(data: {
  trabajadorId: string;
  username: string;
  email?: string;
  password: string;
  temporary_password?: boolean;
  roles?: string[];
}) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/trabajadores/${data.trabajadorId}/create-user`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        temporary_password: data.temporary_password ?? true,
        roles: data.roles || ["user"],
      }),
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error creando usuario para trabajador:", error);
    throw error;
  }
}

export async function actualizarContrasenaUsuario(
  trabajadorId: string,
  passwordData: {
    new_password: string;
    temporary?: boolean;
  }
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/trabajadores/${trabajadorId}/user/password`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(passwordData),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error actualizando contraseña:", error);
    throw error;
  }
}

export async function actualizarRolesUsuario(
  trabajadorId: string,
  rolesData: { roles: string[] }
) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/trabajadores/${trabajadorId}/user/roles`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(rolesData),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error actualizando roles:", error);
    throw error;
  }
}

export async function desactivarUsuario(trabajadorId: string, reason: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/trabajadores/${trabajadorId}/user/disable`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ reason }),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error desactivando usuario:", error);
    throw error;
  }
}

export async function activarUsuario(trabajadorId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/trabajadores/${trabajadorId}/user/enable`,
      {
        method: "PATCH",
        headers,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error activando usuario:", error);
    throw error;
  }
}

export async function desvincularUsuario(trabajadorId: string, reason: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/trabajadores/${trabajadorId}/user`,
      {
        method: "DELETE",
        headers,
        body: JSON.stringify({ reason }),
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error desvinculando usuario:", error);
    throw error;
  }
}

export async function obtenerInfoUsuario(trabajadorId: string) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/trabajadores/${trabajadorId}/user/info`,
      {
        method: "GET",
        headers,
      }
    );
    return await handleApiResponse(response);
  } catch (error) {
    console.error("Error obteniendo información del usuario:", error);
    throw error;
  }
}
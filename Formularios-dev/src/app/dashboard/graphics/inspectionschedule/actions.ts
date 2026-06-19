"use server";

import { getAuthHeaders, handleApiResponse } from "@/lib/actions/helpers";
import { API_BASE_URL } from "@/lib/constants";
import type { TemplateItem, TemplateInstance } from "./types/IControlSemestral";

export async function obtenerTemplates(): Promise<TemplateItem[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/templates`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  return handleApiResponse<TemplateItem[]>(response);
}

export async function obtenerInstancias(): Promise<TemplateInstance[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/instances?limit=1000&populate=templateId`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );
  const data = await handleApiResponse<{ data: TemplateInstance[] }>(response);
  return data.data || [];
}

export async function obtenerDatosControlSemestral(): Promise<{
  templates: TemplateItem[];
  instances: TemplateInstance[];
}> {
  const [templates, instances] = await Promise.all([
    obtenerTemplates(),
    obtenerInstancias(),
  ]);
  return { templates, instances };
}

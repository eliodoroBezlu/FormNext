import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const { data: session, status } = useSession();
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async <D = undefined>(
      method: "get" | "post" | "put" | "delete",
      endpoint: string,
      data?: D
    ) => {
      if (status === "loading") {
        return;
      }

      if (!session?.accessToken) {
        setState((prev) => ({
          ...prev,
          error: "No authentication token available",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        let result: T;

        switch (method) {
          case "get":
            result = await apiClient.get<T>(endpoint);
            break;
          case "post":
            result = await apiClient.post<T, D>(endpoint, data);
            break;
          case "put":
            result = await apiClient.put<T, D>(endpoint, data);
            break;
          case "delete":
            result = await apiClient.delete<T>(endpoint);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        setState({
          data: result,
          loading: false,
          error: null,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        throw error;
      }
    },
    [session, status]
  );

  const get = useCallback(
    (endpoint: string) => execute("get", endpoint),
    [execute]
  );
  const post = useCallback(
    <D>(endpoint: string, data: D) => execute("post", endpoint, data),
    [execute]
  );
  const put = useCallback(
    <D>(endpoint: string, data: D) => execute("put", endpoint, data),
    [execute]
  );
  const del = useCallback(
    (endpoint: string) => execute("delete", endpoint),
    [execute]
  );

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
  };
}

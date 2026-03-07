const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export const BASE_PATH =
  rawBasePath && rawBasePath !== "/"
    ? rawBasePath.startsWith("/")
      ? rawBasePath.replace(/\/$/, "")
      : `/${rawBasePath.replace(/\/$/, "")}`
    : ""

export function withBasePath(path: string): string {
  if (!BASE_PATH) return path
  if (!path || path === "/") return BASE_PATH || "/"
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`
}

export function stripBasePath(path: string): string {
  if (!BASE_PATH) return path
  if (path === BASE_PATH) return "/"
  if (path.startsWith(`${BASE_PATH}/`)) {
    return path.slice(BASE_PATH.length)
  }
  return path
}
